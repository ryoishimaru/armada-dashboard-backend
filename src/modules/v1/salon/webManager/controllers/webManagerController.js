class webManagerController {
  constructor({ responseHandler, webManagerService }) {
    (this.responseHandler = responseHandler),
      (this.webManagerService = webManagerService);
  }

  // uploadToServer controller
  async uploadToServer(req, res, next) {
    const returnData = await this.webManagerService.deployToFtp(
      req.body,
      req.headers,
      req.user
    );
    await this.responseHandler.handleServiceResponse(req, res, returnData);
  }
}

module.exports = webManagerController;
