import { StatusCodes } from "http-status-codes";
import tableConstants from '~/constants/tableConstants';
import commonConstants from '~/constants/commonConstants';
import Path from "path";

class productService {
  constructor({ DateTimeUtil, logger, commonHelpers, saProductModel, FileUpload }) {
    this.DateTimeUtil = DateTimeUtil;
    this.logger = logger;
    this.commonHelpers = commonHelpers;
    this.saProductModel = saProductModel;
    this.FileUpload = FileUpload;
  }

  /*
   Add product service
   @requestdata request body data
  */
  async saveProduct(requestdata,requestFiles) {
    try {
      // Destructure requestdata object
      const { name, detailedName, minPrice, maxPrice, htmlFileName } = requestdata;
      
      const product_data = {
        name,
        detailedName,
        minPrice,
        maxPrice, 
        htmlFileName
      };

      // Checking if the file is present
      if(!requestdata.productId){
        if(!requestFiles) return await this.commonHelpers.prepareResponse(StatusCodes.BAD_REQUEST, 'PRODUCT_IMG_REQUIRED');
        // Validate the file
        if (!Array.isArray(requestFiles.image)) {
            const error = await this.validateProductImg(requestFiles.image);
            if (error) return error;
        } else {
            for (const element of requestFiles.image) {
                const error = await this.validateProductImg(element);
                if (error) return error;
            }
        }
     }



      if(requestdata.productId){
        const decodedProductId = this.commonHelpers.decrypt(
          requestdata.productId
        );

        const isProductExist = await this.saProductModel.fetchObjWithSingleRecord(
          { id: decodedProductId}, 'id', tableConstants.PRODUCT
        );
        
        if (!isProductExist) {
          return await this.commonHelpers.prepareResponse(StatusCodes.BAD_REQUEST, 'INVALID_PRODUCT_ID');
        }

        if(requestFiles){
        if (!Array.isArray(requestFiles.image)) {
          await this.saProductModel.deleteObj({productId:decodedProductId}, tableConstants.PRODUCT_IMG_MAPPING);
          const image = await this.FileUpload.uploadFile(
            requestFiles.image,
            commonConstants.PRODUCT.FILE_UPLOAD_PATH
          );
          await this.saProductModel.createObj(
            {
              image: image.name,
              productId: decodedProductId,
              createdAt: this.DateTimeUtil.getCurrentTimeObjForDB(),
            },
            tableConstants.PRODUCT_IMG_MAPPING
          );
        } else {
          await this.saProductModel.deleteObj({productId:decodedProductId}, tableConstants.PRODUCT_IMG_MAPPING);
          const file_name_array = [];
          for (const file of requestFiles.image) {
            const uploaded_file = await this.FileUpload.uploadFile(
              file,
              commonConstants.PRODUCT.FILE_UPLOAD_PATH
            );
            file_name_array.push({
              image: uploaded_file.name,
              productId: decodedProductId,
              createdAt: this.DateTimeUtil.getCurrentTimeObjForDB(),
            });
          }
          await this.saProductModel.createObj(
            file_name_array,
            tableConstants.PRODUCT_IMG_MAPPING
          );
        }
        }
        
        await this.saProductModel.updateObj(product_data, { id: decodedProductId}, tableConstants.PRODUCT);
        return await this.commonHelpers.prepareResponse(StatusCodes.OK,"SUCCESS");
      }

      // Set creation timestamp for the product
      product_data.createdAt = this.DateTimeUtil.getCurrentTimeObjForDB();

      // Create new product in the database
      const productId = await this.saProductModel.createObj(product_data, tableConstants.PRODUCT);

      // Upload the files
      if (!Array.isArray(requestFiles.image)) {
        const image = await this.FileUpload.uploadFile(
          requestFiles.image,
          commonConstants.PRODUCT.FILE_UPLOAD_PATH
        );

        // Product file uploading at Raku2BBC server
        const filePath = Path.join(process.cwd(), 'uploads', 'product');
        await this.commonHelpers.uploadFileToSFTP(`${filePath}/${image.name}`, `/file/ae_direct/${image.name}`);

        await this.saProductModel.createObj(
          {
            image: image.name,
            productId: productId,
            createdAt: product_data.createdAt,
          },
          tableConstants.PRODUCT_IMG_MAPPING
        );
      } else {
        const file_name_array = [];
        for (const file of requestFiles.image) {
          const uploaded_file = await this.FileUpload.uploadFile(
            file,
            commonConstants.PRODUCT.FILE_UPLOAD_PATH
          );

          // Product file uploading at Raku2BBC server
          const filePath = Path.join(process.cwd(), 'uploads', 'product');
          await this.commonHelpers.uploadFileToSFTP(`${filePath}/${uploaded_file.name}`, `/file/ae_direct/${uploaded_file.name}`);

          file_name_array.push({
            image: uploaded_file.name,
            productId: productId,
            createdAt: product_data.createdAt,
          });
        }
        await this.saProductModel.createObj(
          file_name_array,
          tableConstants.PRODUCT_IMG_MAPPING
        );
      }

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

  /*
  * Validates a product image file for size and extension.
  * @param {Object} file - The file to validate.
  */
  async validateProductImg(file) {
    // Checking image size
    if (Math.round(file.size) >= commonConstants.PRODUCT.MAX_ALLOW_FILE_SIZE) {
        return await this.commonHelpers.prepareResponse(StatusCodes.BAD_REQUEST, "PRODUCT_IMG_SIZE_LIMIT");
    }
    // Checking extension
    const extension_name = Path.extname(file.name).toLowerCase();
    const allowed_extensions = commonConstants.PRODUCT.ALLOW_EXTENSIONS;
    if (!allowed_extensions.includes(extension_name)) {
        return await this.commonHelpers.prepareResponse(StatusCodes.BAD_REQUEST, "PRODUCT_IMG_INVALID_EXTENTION");
    }
    return null; // No error
  };

  /*
  List product service
  */
  async getProducts(reqQuery) {
      try {

          let pageNo = reqQuery.pageNo;

          if (pageNo <= 0 || pageNo == undefined) {
              pageNo = 1;
          }
          
          let limit = 10,
          offset = (pageNo - 1) * limit;

          // Fetch product list
          const productList = await this.saProductModel.fetchProduct(offset, false);
      
          // Fetch total count of product
          const productCount = await this.saProductModel.fetchProduct(offset, true);
      
          // Check product list data exist or not
          if (productList) {
              productList.forEach(item => {
              console.log(item);
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

  /*
  Delete product service
  @reqParams request productId
  */
  async deleteProduct(reqParams) {
      try {

          const where={
          id: this.commonHelpers.decrypt(reqParams.productId)
          }
  
          // Fetch the product object with the given ID
          let isValidProductId = await this.saProductModel.fetchObjWithSingleRecord(where, "id", tableConstants.PRODUCT);
  
          // Check if the product ID is valid
          if(!isValidProductId){
          // Return a bad request response if the product ID is invalid
          return await this.commonHelpers.prepareResponse(
              StatusCodes.BAD_REQUEST,
              "INVALID_PRODUCT_ID"
          );  
          }
  
          // Delete the product
          await this.saProductModel.deleteObj(
              where,
              tableConstants.PRODUCT
          );
  
          // Return a success response after successful deletion
          return await this.commonHelpers.prepareResponse(
          StatusCodes.OK,
          "SUCCESS"
          );
  
      } catch (error) {
          // Log any errors that occur
          this.logger.error(error);
          // Return the error object
          return error;
      }
  }

  /*
  Get product detail service
  @reqParams request reqParams
  */
  async getProductDetail(reqParams) {

      try {
  
        // Decrypt productId
        const productId = this.commonHelpers.decrypt(reqParams.productId);
  
        // Fetch the product object with the given ID
        let isValidProductId = await this.saProductModel.fetchObjWithSingleRecord({ "id": productId }, "id", tableConstants.PRODUCT);
  
        // Check if the product ID is valid
        if (!isValidProductId) {
          // Return a bad request response if the product ID is invalid
          return await this.commonHelpers.prepareResponse(
            StatusCodes.BAD_REQUEST,
            "INVALID_PRODUCT_ID"
          );
        }
  
        // Define query conditions 
        const [product] = await this.saProductModel.fetchProductDetails({"prod.id":productId});
        
        product.id = this.commonHelpers.encrypt(product.id),
        product.images = product.images.split(',');

        return await this.commonHelpers.prepareResponse(
          StatusCodes.OK,
          "SUCCESS",
          product
        );
      } catch (error) {
        // Log any errors that occur
        this.logger.error(error);
        // Return the error object
        return error;
      }
  }
}

module.exports = productService;