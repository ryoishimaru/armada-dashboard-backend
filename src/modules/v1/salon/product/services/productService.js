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
  // try to upload a nnew file olver ther server linwxdd
  /*
   Add product service
   @requestdata request body data
  async saveProduct(requestdata,requestFiles) {
    try {

      const filePath = path.join(process.cwd(), 'uploads', 'product');
      await this.commonHelpers.uploadFileToSFTP(`${filePath}/10acg9a0sm2lkbko2.jpg`, '/file/ae_direct/10acg9a0sm2lkbko2.jpg');
      
      // Fetch the OAuth token
      const token = await commonServiceObj.getOAuthToken();

      // URL for creating the product
      const url = 'https://shop.armada-style.com/api/v2/products/create';

      // Set the headers for the request
      const config = {
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Bearer ${token}`
          }
      };

      // Prepare the request body and convert to URL encoded string
      const data = {
          products: JSON.stringify([
              {
                  product: {
                      "common_code": "PROD062276",
                      "note": "",
                      "status": "0",
                      "common_product_code": "062276",
                      "product_type_id": "1",
                      "main_list_comment": "",
                      "name": "Test Product",
                      "price02": "2500",
                      "weight": "1913",
                      "tax_flag": "0",
                      "daibiki_flag": "0",
                      "deliv_id": "aeDirect（5000円以上送料代引き無料）,aeDirect（送料代引き無料）",
                      "postage_flag": "0",
                      "price_type": "0",
                      "price_show_type": "0",
                      "sales_channel_mode": "1",
                      "sale_limit_flg": "1",
                      "sale_limit_min": "-1",
                      "sale_limit": "-1",
                      "sell_flag": "1",
                      "stock_unlimited": "1"
                  }
              }
          ])
      };

      // Make the POST request with URL encoded data
      const response = await axios.post(url, qs.stringify(data), config);
      
      // Return success response
      return await this.commonHelpers.prepareResponse(
        StatusCodes.OK,
        "SUCCESS",
        response.data
      );
    } catch (error) {
      // Log error if any occurs
      this.logger.error(error);
      // Return the error
      return error;
    }
  }
  */
  async saveProduct(requestDataArray, requestFiles, reqUser) {
    try {
      const decryptedUserId = this.commonHelpers.decrypt(reqUser.user_id);
      const salonCode = reqUser.salon_code;

      // Delete existing products for this salon in the mapping table
      await this.ProductModel.deleteObj(
        { salonId: decryptedUserId },
        tableConstants.SALON_PRODUCT_MAPPING
      );

      const responses = []; // Array to store responses for each product

      // Define discount mapping outside of loops and conditions
      const discountMap = { 1: 10, 2: 15, 3: 20 };
      
      for (const requestdata of requestDataArray) {
        // Decrypt product ID and initialize product mapping object
        const decryptedProductId = this.commonHelpers.decrypt(
          requestdata.id
        );
        let productMappingObj = { ...requestdata };

        // Product file uploading at Raku2BBC server
        const fileName = productMappingObj.images.split('/').pop();
        const filePath = path.join(process.cwd(), 'uploads', 'product');
        await this.commonHelpers.uploadFileToSFTP(`${filePath}/${fileName}`, `/file/ae_direct/${fileName}`);

        productMappingObj.salonId = decryptedUserId;
        productMappingObj.productId = decryptedProductId;
        productMappingObj.createdAt =
          this.DateTimeUtil.getCurrentTimeObjForDB();

        // Exclude name and detailedName from database insertion object
        const { name, detailedName, id, images, ...filteredProductMappingObj } =
          productMappingObj;
        
        // Save product data to database
        await this.ProductModel.createObj(
          filteredProductMappingObj,
          tableConstants.SALON_PRODUCT_MAPPING
        );

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
      }
      console.log(responses[0].response);
      // Return success response with all product creation responses
      return await this.commonHelpers.prepareResponse(
        StatusCodes.OK,
        "SUCCESS",
        responses
      );
    } catch (error) {
      // Log any errors and return them
      this.logger.error(error);
      return error;
    }
  }
  
  /*
  List product service
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
          (item.id = this.commonHelpers.encrypt(item.id)),
            (item.images = item.images.split(","));
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
}

module.exports = productService;