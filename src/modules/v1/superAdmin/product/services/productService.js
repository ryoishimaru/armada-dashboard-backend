import { StatusCodes } from "http-status-codes";
import tableConstants from '~/constants/tableConstants';

class productService {
  constructor({ DateTimeUtil, logger, commonHelpers, saProductModel }) {
    this.DateTimeUtil = DateTimeUtil;
    this.logger = logger;
    this.commonHelpers = commonHelpers;
    this.saProductModel = saProductModel;
  }

  /*
   Save product service
   @request_data request body data
  */
  async saveProduct(request_data) {
    try {
      // Destructure request_data object
      const { name, detailedName, minPrice, maxPrice, htmlFileName, image } = request_data;
      
      const product_data = {
        name,
        detailedName,
        minPrice,
        maxPrice, 
        htmlFileName,
        image
      };

      // Set creation timestamp for the product
      product_data.createdAt = this.DateTimeUtil.getCurrentTimeObjForDB();
      // Create new product in the database
      await this.saProductModel.createObj(product_data, tableConstants.PRODUCT);

      // Return success response
      return await this.commonHelpers.prepareResponse(
        StatusCodes.OK,
        "SUCCESS"
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