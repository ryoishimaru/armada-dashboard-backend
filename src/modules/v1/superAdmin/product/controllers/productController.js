class productController {

    constructor({ saProductService, responseHandler }) {
        this.saProductService = saProductService;
        this.responseHandler = responseHandler
    }
    
    // Save product controller
    async saveProduct(req, res, next) {
        const returnData = await this.saProductService.saveProduct(req.body);
        await this.responseHandler.handleServiceResponse(req, res, returnData);
    }
}

module.exports = productController;