import BaseModel from '~/models/BaseModel';
import tableConstants from '~/constants/tableConstants';
import commonConstants from '~/constants/commonConstants';

class ProductModel extends BaseModel {
  constructor({ db, logger }) {
    super();
    this.db = db;
    this.logger = logger;
  }
}

module.exports = ProductModel;

