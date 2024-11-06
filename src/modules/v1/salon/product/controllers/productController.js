class productController {

    constructor({ productService, responseHandler }) {
        this.productService = productService;
        this.responseHandler = responseHandler
    }
    
    // Get products controller
    async getProducts(req, res, next) {
        const returnData = await this.productService.getProducts(req.query, req.user);
        await this.responseHandler.handleServiceResponse(req, res, returnData);
    }

    // Save product controller
    async saveProduct(req, res, next) {
        const returnData = await this.productService.saveProduct(req.body, req.files, req.user);
        await this.responseHandler.handleServiceResponse(req, res, returnData);
    }
}

module.exports = productController;