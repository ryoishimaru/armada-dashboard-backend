import BaseModel from '~/models/BaseModel';
class ProductModel extends BaseModel {
  constructor({ db, logger }) {
    super();
    this.db = db;
    this.logger = logger;
  }
}

module.exports = ProductModel;

