import { StatusCodes } from "http-status-codes";
import { commonServices } from '~/services/commonServices';
import axios from "axios";
import path from "path";

const qs = require('qs');

const commonServiceObj = new commonServices();

class productService {
  constructor({ DateTimeUtil, logger, commonHelpers, ProductModel, FileUpload }) {
    this.DateTimeUtil = DateTimeUtil;
    this.logger = logger;
    this.commonHelpers = commonHelpers;
    this.ProductModel = ProductModel;
    this.FileUpload = FileUpload;
  }

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
  async saveProduct(requestdata,requestFiles) {
    try {

      const data = {
        products: [
            {
                product: {
                    common_code: "",
                    note: "",
                    status: "",
                    common_product_code: "",
                    product_type_id: "",
                    main_list_comment: "",
                    name: "",
                    price02: "",
                    weight: "",
                    tax_flag: "",
                    daibiki_flag: "",
                    deliv_id: "",
                    postage_flag: "",
                    price_type: "",
                    price_show_type: "",
                    sales_channel_mode: "",
                    sale_limit_flg: "",
                    sale_limit_min: "",
                    sale_limit: "",
                    sell_flag: "",
                    stock_unlimited: ""
                }
            }
        ]
      };

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

  /*
  List product service
  */
  async getProducts(reqQuery, reqUser) {
    try {

        const decryptedUserId = this.commonHelpers.decrypt(reqUser.user_id);

        let pageNo = reqQuery.pageNo;

        if (pageNo <= 0 || pageNo == undefined) {
            pageNo = 1;
        }
        
        let limit = 10,
        offset = (pageNo - 1) * limit;

        // Fetch product list
        const productList = await this.ProductModel.fetchProduct(decryptedUserId, offset, false);
        
        // Fetch total count of product
        const productCount = await this.ProductModel.fetchProduct(decryptedUserId, offset, true);
    
        // Check product list data exist or not
        if (productList) {
            productList.forEach(item => {
            item.id = this.commonHelpers.encrypt(item.id),
            item.images = item.images.split(',');
            });
        }
        
        const totalData = offset + limit;
          let loadMore = false;
          
          if (totalData < productCount) {
          loadMore = true;
        }

        return await this.commonHelpers.prepareResponse(StatusCodes.OK,"SUCCESS", {productList, loadMore, count:productCount});
    } catch (error) {
        this.logger.error(error);
        return error;
    }
  }

}

module.exports = productService;