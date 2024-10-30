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
  */
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
}

module.exports = productService;