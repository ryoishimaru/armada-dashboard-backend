class productController {

    constructor({ saProductService, responseHandler }) {
        this.saProductService = saProductService;
        this.responseHandler = responseHandler
    }
    
    // Save product controller
    async saveProduct(req, res, next) {
        const returnData = await this.saProductService.saveProduct(req.body, req.files);
        await this.responseHandler.handleServiceResponse(req, res, returnData);
    }
    
    // Get products controller
    async getProducts(req, res, next) {
        const returnData = await this.saProductService.getProducts(req.query);
        await this.responseHandler.handleServiceResponse(req, res, returnData);
    }

    // Delete product controller
    async deleteProduct(req, res, next) {
        const returnData = await this.saProductService.deleteProduct(req.params);
        await this.responseHandler.handleServiceResponse(req, res, returnData);
    }

    // Get product detail controller
    async getProductDetail(req, res, next) {
        const returnData = await this.saProductService.getProductDetail(req.params);
        await this.responseHandler.handleServiceResponse(req, res, returnData);
    }
    
}

module.exports = productController;