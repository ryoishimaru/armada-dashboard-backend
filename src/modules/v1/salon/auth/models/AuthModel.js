import BaseModel from '~/models/BaseModel';
class AuthModel extends BaseModel {
  constructor({ db, logger }) {
    super();
    this.db = db;
    this.logger = logger;
  }
}

module.exports = AuthModel;

