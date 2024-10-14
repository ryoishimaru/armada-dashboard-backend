class authController {

    constructor({ saAuthService, responseHandler }) {
        this.saAuthService = saAuthService;
        this.responseHandler = responseHandler
    }
    
    // Login controller
    async login(req, res, next) {
        const returnData = await this.saAuthService.loginService(req.body, req.headers);
        await this.responseHandler.handleServiceResponse(req, res, returnData);
    }
}

module.exports = authController;