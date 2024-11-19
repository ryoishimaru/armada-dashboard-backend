import { StatusCodes } from "http-status-codes";
import { commonServices } from '~/services/commonServices';
import tableConstants from '~/constants/tableConstants';
import axios from "axios";
import path from "path";

const qs = require('qs');

const commonServiceObj = new commonServices();

class productService {
  constructor({
    DateTimeUtil,
    logger,
    commonHelpers,
    ProductModel,
    FileUpload,
  }) {
    this.DateTimeUtil = DateTimeUtil;
    this.logger = logger;
    this.commonHelpers = commonHelpers;
    this.ProductModel = ProductModel;
    this.FileUpload = FileUpload;
  }

  /**
   * Saves and maps products for a salon, deletes existing mappings, and uploads new products to an external API.
   * Supports regular and subscription-based products with optional discount handling.
   */
  async saveProduct(requestDataArray, requestFiles, reqUser) {
    try {
      const decryptedUserId = this.commonHelpers.decrypt(reqUser.user_id);
      const salonCode = reqUser.salon_code;

      const getPreviousProducts = await this.ProductModel.fetchObj(
        { salonId: decryptedUserId },
        tableConstants.SALON_PRODUCT_MAPPING
      );

      const dataToDelete = getPreviousProducts
        .filter((dbItem) => {
          const matchedRequest = requestDataArray.find((reqItem) => {
            const decryptedId = this.commonHelpers.decrypt(reqItem.id);
            console.log(`decryptedId: ${decryptedId}`);
            return decryptedId == String(dbItem.productId);
          });
          return !matchedRequest && dbItem.externalProductId !== null;
        })
        .map((item) => item.externalProductId); 


      const externalProductIds = dataToDelete.flatMap(item => item.split(','));
      console.log("IDs to delete:", externalProductIds);
        
      // Delete existing products for this salon in the mapping table
      await this.ProductModel.deleteObj(
        { salonId: decryptedUserId },
        tableConstants.SALON_PRODUCT_MAPPING
      );

      await this.deleteProduct(externalProductIds);

      // Define discount mapping outside of loops and conditions
      const discountMap = { 1: 10, 2: 15, 3: 20 };

      for (const requestdata of requestDataArray) {
        const responses = [],
          savedProductIds = [];

        // Decrypt product ID and initialize product mapping object
        const decryptedProductId = this.commonHelpers.decrypt(requestdata.id);
        let productMappingObj = { ...requestdata };

        productMappingObj.salonId = decryptedUserId;
        productMappingObj.productId = decryptedProductId;
        productMappingObj.createdAt =
          this.DateTimeUtil.getCurrentTimeObjForDB();

        // Exclude name and detailedName from database insertion object
        const { name, detailedName, id, images, ...filteredProductMappingObj } =
          productMappingObj;

        const productFullName = `${productMappingObj.name}_${productMappingObj.detailedName}`; // Combine name and detailedName for full name

        // Set selling price
        if (productMappingObj.hasRegularSales) {
          productMappingObj.sellingPrice = productMappingObj.sellingPrice;
        }

        // Calculate subscription discount if applicable
        if (productMappingObj.isSubscribed) {
          const calcDiscount =
            discountMap[productMappingObj.discountRateOnSubscription] || 0;
          productMappingObj.sellingPrice =
            productMappingObj.sellingPrice * (1 - calcDiscount / 100);
        }

        // Prepare API request data with "_system" postfix
        const dataTemplate = {
          common_code: `${salonCode}_${decryptedProductId}_system`,
          common_product_code: `${salonCode}_${decryptedProductId}_system`,
          product_type_id: 1,
          name: productFullName,
          price02: productMappingObj.sellingPrice,
          deliv_id: "aeDirect（送料代引き無料）",
          sales_channel_mode: 1,
          sale_limit_flg: 1,
          point_rate: 0,
          tax_flag: 0,
          zaiko_type: 0,
          status: 0,
          main_large_image: `ae_direct/${productMappingObj.images
            .split("/")
            .pop()}`,
          ...(productMappingObj.isSubscribed && {
            product_reg_flag: "定期商品",
          }),
        };

        const data = {
          products: JSON.stringify([{ product: { ...dataTemplate } }]),
        };

        // Get OAuth token for authentication
        const token = await commonServiceObj.getOAuthToken();

        // Set headers for the request
        const config = {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${token}`,
          },
        };

        // Make the initial API call with regular price
        const response = await axios.post(
          "https://shop.armada-style.com/api/v2/products/create",
          qs.stringify(data),
          config
        );

        responses.push(response.data); // Store the response

        // Check if both hasRegularSales and isSubscribed conditions are true
        if (
          productMappingObj.hasRegularSales &&
          productMappingObj.isSubscribed
        ) {
          // Apply discount for second creation
          const discountPrice =
            productMappingObj.sellingPrice *
            (1 -
              (discountMap[productMappingObj.discountRateOnSubscription] || 0) /
                100);

          // Prepare data for the discounted product with "_system_t" postfix
          const discountedData = {
            products: JSON.stringify([
              {
                product: {
                  ...dataTemplate,
                  common_code: `${salonCode}_${decryptedProductId}_system_t`, // Postfix "_system_t" for discounted product
                  common_product_code: `${salonCode}_${decryptedProductId}_system_t`, // Postfix "_system_t" for discounted product
                  price02: discountPrice, // Apply discounted price
                },
              },
            ]),
          };

          // Make the second API call for the discounted price product
          const discountResponse = await axios.post(
            "https://shop.armada-style.com/api/v2/products/create",
            qs.stringify(discountedData),
            config
          );
          responses.push(discountResponse.data); // Store the response
        }

        // Save product data to database
        const [insertedProductId] = await this.ProductModel.createObj(
          filteredProductMappingObj,
          tableConstants.SALON_PRODUCT_MAPPING
        );

        for (const element of responses) {
          savedProductIds.push(element.response.products[0].id);
        }

        const savedProductIdsStr = savedProductIds.join(",");
        await this.ProductModel.updateObj(
          { externalProductId: savedProductIdsStr },
          { id: insertedProductId },
          tableConstants.SALON_PRODUCT_MAPPING
        );
      }

      // Return success response with all product creation responses
      return await this.commonHelpers.prepareResponse(
        StatusCodes.OK,
        "SUCCESS"
      );
    } catch (error) {
      // Log any errors and return them
      this.logger.error(error);
      return error;
    }
  }

  /**
   * Retrieves a list of products for a salon user, with encrypted IDs and processed image URLs.
   */
  async getProducts(reqQuery, reqUser) {
    try {
      const decryptedUserId = this.commonHelpers.decrypt(reqUser.user_id);

      /*
        let pageNo = reqQuery.pageNo;

        if (pageNo <= 0 || pageNo == undefined) {
            pageNo = 1;
        }
        
        let limit = 10,
        offset = (pageNo - 1) * limit;
        */

      // Fetch product list
      const productList = await this.ProductModel.fetchProduct(decryptedUserId);

      // Fetch total count of product
      // const productCount = await this.ProductModel.fetchProduct(decryptedUserId, true);

      // Check product list data exist or not
      if (productList) {
        productList.forEach((item) => {
          item.id = this.commonHelpers.encrypt(item.id);
          item.images = item.images.split(",");
          if (item.externalProductId) {
            item.externalProductId = item.externalProductId.split(",");
          }
        });
      }

      /*
        const totalData = offset + limit;
          let loadMore = false;
          
        if (totalData < productCount) {
          loadMore = true;
        }
        */

      return await this.commonHelpers.prepareResponse(
        StatusCodes.OK,
        "SUCCESS",
        { productList, count: productList.length }
      );
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  /*
  Delete product service
  */
  // async deleteProduct(requestDataArray) {
  //   try {
  //     // Get OAuth token for authentication
  //     const token = await commonServiceObj.getOAuthToken();

  //     // Set headers for the request
  //     const config = {
  //       headers: {
  //         "Content-Type": "application/x-www-form-urlencoded",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     };

  //     // Process each request sequentially
  //     console.log("requestDataArray",requestDataArray);

  //     for (const requestdata of requestDataArray) {
  //       let productMappingObj = { ...requestdata };
  //       console.log('log-itration');
  //       if (productMappingObj.externalProductId) {
  //         console.log(
  //           "productMappingObj.externalProductId: ",
  //           productMappingObj.externalProductId
  //         );

  //         if (Array.isArray(productMappingObj.externalProductId)) {
  //           for (const productId of productMappingObj.externalProductId) {
  //             // Prepare API request data
  //             const dataTemplate = {
  //               product_id: `${productId}`,
  //             };
  //             console.log(productId);

  //             const data = {
  //               products: JSON.stringify([{ product: { ...dataTemplate } }]),
  //             };

  //             // Execute the API call and wait for it to complete
  //             try {
  //               const response = await axios.post(
  //                 "https://shop.armada-style.com/api/v2/products/remove",
  //                 qs.stringify(data),
  //                 config
  //               );
  //               console.log(
  //                 `Product ${productId} removed successfully:`,
  //                 response.data
  //               );
  //             } catch (error) {
  //               console.error(
  //                 `Error removing product ${productId}:`,
  //                 error.response?.data || error.message
  //               );
  //             }
  //           }
  //         }
  //       }
  //     }

  //     console.log("All products processed successfully.");
  //   } catch (error) {
  //     console.error("Error during deleteProduct:", error);
  //   }
  // }
  async deleteProduct(productIdArray) {
    try {
      // Get OAuth token for authentication
      const token = await commonServiceObj.getOAuthToken();
  
      // Set headers for the request
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      };
  
      // Iterate over productIdArray sequentially
      for (const productId of productIdArray) {
        // Prepare API request data
        const dataTemplate = {
          product_id: `${productId}`,
        };
        console.log(`Processing product ID: ${productId}`);
  
        const data = {
          products: JSON.stringify([{ product: { ...dataTemplate } }]),
        };
  
        // Execute the API call and wait for it to complete
        try {
          const response = await axios.post(
            "https://shop.armada-style.com/api/v2/products/remove",
            qs.stringify(data),
            config
          );
          console.log(
            `Product ${productId} removed successfully:`,
            response.data
          );
        } catch (error) {
          console.error(
            `Error removing product ${productId}:`,
            error.response?.data || error.message
          );
        }
      }
  
      console.log("All products processed successfully.");
    } catch (error) {
      console.error("Error during deleteProduct:", error);
    }
  }  
}

module.exports = productService;