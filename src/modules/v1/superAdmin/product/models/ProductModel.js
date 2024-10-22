import BaseModel from '~/models/BaseModel';
import tableConstants from '~/constants/tableConstants';
import commonConstants from '~/constants/commonConstants';
class ProductModel extends BaseModel {
  constructor({ db, logger }) {
    super();
    this.db = db;
    this.logger = logger;
  }

  /** 
    Fetch products
  */
  async fetchProduct(offset, getCount, limit = 10) {
    try {
      // Build the base query with the orderBy condition
      let baseQuery = this.db(`${tableConstants.PRODUCT} as prod`);

      if (!getCount) {
        baseQuery
          .select(
            "prod.id",
            "name",
            "detailedName",
            "minPrice",
            "maxPrice",
            "htmlFileName",
            this.db.raw(
              `GROUP_CONCAT(CONCAT('${process.env.ASSETS_URL_BASE}/${commonConstants.PRODUCT.FILE_UPLOAD_PATH}/', product_imgs.image) ORDER BY product_imgs.id SEPARATOR ",") as images`
            )
          )
          .groupBy("prod.id")
          .orderBy("id","DESC");
          baseQuery.leftJoin(
            `${tableConstants.PRODUCT_IMG_MAPPING} as product_imgs`,
            `product_imgs.productId`,
            `prod.id`
        )
      } else {
        baseQuery.countDistinct(`id as totalCount`);
      }

      if (!getCount) {
        // Apply pagination conditionally...
        baseQuery.offset(offset).limit(limit);
      }

      // Execute the query
      const result = await baseQuery;

      if (!getCount) {
        return result;
      } else {
        return result[0].totalCount;
      }
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  /** 
    Fetch product details
  */
  async fetchProductDetails(query) {

    try {
        // Define the columns to be selected
        const cols = [
            `prod.id`,
            `name`,
            `detailedName`,
            `minPrice`,
            `maxPrice`,
            `htmlFileName`,
            this.db.raw(
              `GROUP_CONCAT(CONCAT('${process.env.ASSETS_URL_BASE}/${commonConstants.PRODUCT.FILE_UPLOAD_PATH}/', product_imgs.image) ORDER BY product_imgs.id SEPARATOR ",") as images`
            )
        ];

        //Get data from product table
        const base_query = this.db(`${tableConstants.PRODUCT} as prod`)
            .select(cols)
            .leftJoin(
                `${tableConstants.PRODUCT_IMG_MAPPING} as product_imgs`,
                `product_imgs.productId`,
                `prod.id`
              )
            .where(query);
        const result = await base_query;
        return result;
    } catch (error) {
        // Log any errors that occur
        this.logger.error(error);
        // Return the error object
        return error;
    }
  }
}

module.exports = ProductModel;

