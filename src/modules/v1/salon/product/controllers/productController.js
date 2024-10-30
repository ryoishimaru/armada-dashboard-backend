class productController {

    constructor({ productService, responseHandler }) {
        this.productService = productService;
        this.responseHandler = responseHandler
    }
    
    // Save product controller
    async saveProduct(req, res, next) {
        const returnData = await this.productService.saveProduct(req.body, req.files);
        await this.responseHandler.handleServiceResponse(req, res, returnData);
    }

}

module.exports = productController;