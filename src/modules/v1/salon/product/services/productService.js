import { StatusCodes } from 'http-status-codes';
import { commonServices } from '~/services/commonServices';
import tableConstants from '~/constants/tableConstants';
import axios from 'axios';
import path from 'path';

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
          return (
            (!matchedRequest && dbItem.externalProductId !== null) ||
            (!matchedRequest?.hasRegularSales && !!dbItem.hasRegularSales) ||
            (!matchedRequest?.isSubscribed && !!dbItem.isSubscribed)
          );
        })
        .map((item) => item.externalProductId);

      const externalProductIds = dataToDelete.flatMap((item) =>
        item.split(',')
      );
      console.log('IDs to delete:', externalProductIds);

      // Delete existing products for this salon in the mapping table
      await this.ProductModel.deleteObj(
        { salonId: decryptedUserId },
        tableConstants.SALON_PRODUCT_MAPPING
      );

      await this.deleteProduct(externalProductIds);

      // Define discount mapping outside of loops and conditions
      const discountMap = { 1: 10, 2: 15, 3: 20 };

      for (const requestdata of requestDataArray) {
        const responses = [];
        let savedProductIds = [];

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

        // Prepare API request data with "_system" postfix
        const dataTemplate = {
          common_code: `${salonCode}_${decryptedProductId}_system`,
          common_product_code: `${salonCode}_${decryptedProductId}_system`,
          product_type_id: 1,
          name: productFullName,
          price02: productMappingObj.sellingPrice,
          deliv_id: 'aeDirect（送料代引き無料）',
          sales_channel_mode: 1,
          sale_limit_flg: 1,
          point_rate: 0,
          tax_flag: 0,
          zaiko_type: 0,
          status: 0,
          main_large_image: `ae_direct/${productMappingObj.images
            .split('/')
            .pop()}`,
        };

        // * 出品時は通常販売か定期販売かで判別して出品する

        // Set selling price
        if (productMappingObj.hasRegularSales) {
          dataTemplate.price02 = productMappingObj.sellingPrice;
          const result = await this.createProduct(dataTemplate);
          console.log(JSON.stringify(result.data));
          responses.push(result.data);
        }

        // Calculate subscription discount if applicable
        if (productMappingObj.isSubscribed) {
          const calcDiscount =
            discountMap[productMappingObj.discountRateOnSubscription] || 0;
          dataTemplate.price02 =
            productMappingObj.sellingPrice * (1 - calcDiscount / 100);
          dataTemplate.common_code = `${salonCode}_${decryptedProductId}_system_t`;
          dataTemplate.common_product_code = `${salonCode}_${decryptedProductId}_system_t`;

          dataTemplate.product_reg_flag = '定期商品';
          const result = await this.createProduct(dataTemplate);
          responses.push(result.data);
        }

        // Save product data to database
        console.log({ filteredProductMappingObj });
        const [insertedProductId] = await this.ProductModel.createObj(
          filteredProductMappingObj,
          tableConstants.SALON_PRODUCT_MAPPING
        );

        const insertedExternalProductIds =
          filteredProductMappingObj.externalProductId.split(',');
        const isExistDeletedProductIds = externalProductIds.find((val) =>
          insertedExternalProductIds.includes(val)
        );

        if (!isExistDeletedProductIds) {
          savedProductIds =
            filteredProductMappingObj.externalProductId.split(',');
        }

        for (const element of responses) {
          if (!element.response.products[0]?.id) continue;
          console.log(element.response.products);
          savedProductIds.push(element.response.products[0].id);
        }

        if (savedProductIds.length != 0) {
          const savedProductIdsStr = savedProductIds.join(',');
          await this.ProductModel.updateObj(
            { externalProductId: savedProductIdsStr },
            { id: insertedProductId },
            tableConstants.SALON_PRODUCT_MAPPING
          );
        }
      }

      // Return success response with all product creation responses
      return await this.commonHelpers.prepareResponse(
        StatusCodes.OK,
        'SUCCESS'
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
          item.images = item.images.split(',');
          if (item.externalProductId) {
            item.externalProductId = item.externalProductId.split(',');
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
        'SUCCESS',
        { productList, count: productList.length }
      );
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async createProduct(dataTemplate) {
    try {
      const data = {
        products: JSON.stringify([{ product: { ...dataTemplate } }]),
      };

      // Get OAuth token for authentication
      const token = await commonServiceObj.getOAuthToken();

      // Set headers for the request
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${token}`,
        },
      };

      // Make the initial API call with regular price
      const response = await axios.post(
        'https://shop.armada-style.com/api/v2/products/create',
        qs.stringify(data),
        config
      );

      return response;
    } catch (e) {
      console.error('Error during createProduct:', error);
    }
  }

  async deleteProduct(productIdArray) {
    try {
      // Get OAuth token for authentication
      const token = await commonServiceObj.getOAuthToken();

      // Set headers for the request
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${token}`,
        },
      };

      // Iterate over productIdArray sequentially
      for (const productId of productIdArray) {
        // Prepare API request data
        const dataTemplate = {
          product_id: `${productId}`,
        };

        const data = {
          products: JSON.stringify([{ product: { ...dataTemplate } }]),
        };

        // Execute the API call and wait for it to complete
        try {
          await axios.post(
            'https://shop.armada-style.com/api/v2/products/remove',
            qs.stringify(data),
            config
          );
        } catch (error) {
          console.error(
            `Error removing product ${productId}:`,
            error.response?.data || error.message
          );
        }
      }
    } catch (error) {
      console.error('Error during deleteProduct:', error);
    }
  }
}

module.exports = productService;
