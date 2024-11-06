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
  async fetchProduct(salonId, offset, getCount, limit = 10) {
    try {
      
      let baseQuery = this.db(`${tableConstants.PRODUCT} as prod`);
        baseQuery
          .select(
            "prod.id",
            "name",
            "detailedName",
            "minPrice",
            "maxPrice",
            this.db.raw(`
            MAX(spm.sellingPrice) AS sellingPrice, 
            MAX(spm.hasRegularSales) AS hasRegularSales, 
            MAX(spm.isSubscribed) AS isSubscribed, 
            MAX(spm.discountRateOnSubscription) AS discountRateOnSubscription`
            ),
            this.db.raw(
              `GROUP_CONCAT(CONCAT('${process.env.ASSETS_URL_BASE}/${commonConstants.PRODUCT.FILE_UPLOAD_PATH}/', product_imgs.image) ORDER BY product_imgs.id SEPARATOR ",") as images`
            ),
            this.db.raw(
              `CASE WHEN spm.productId IS NOT NULL THEN 1 ELSE 0 END as isMappedToSalon`
            )
          )
          .leftJoin(
            `${tableConstants.PRODUCT_IMG_MAPPING} as product_imgs`,
            `product_imgs.productId`,
            `prod.id`
          )
          .leftJoin(
            `${tableConstants.SALON_PRODUCT_MAPPING} as spm`,
            function () {
              this.on("spm.productId", "=", "prod.id").andOn(
                "spm.salonId",
                "=",
                salonId
              );
            }
          )
          .groupBy("prod.id")
          .orderBy("prod.id", "DESC");
    

      // Execute the query
      const result = await baseQuery;

      return result;
      
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }
}

module.exports = ProductModel;

