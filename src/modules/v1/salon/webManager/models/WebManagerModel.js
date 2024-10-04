import BaseModel from '~/models/BaseModel';
class WebManagerModel extends BaseModel {
  constructor({ db, logger }) {
    super();
    this.db = db;
    this.logger = logger;
  }
}

module.exports = WebManagerModel;

