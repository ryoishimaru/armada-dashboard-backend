class authController {

    constructor({ authService, responseHandler }) {
        this.authService = authService;
        this.responseHandler = responseHandler
    }

    // Signup controller
    async signup(req, res, next) {
        const returnData = await this.authService.signupService(req.body, req.query);
        await this.responseHandler.handleServiceResponse(req, res, returnData);
    }

    // Login controller
    async login(req, res, next) {
        const returnData = await this.authService.loginService(req.body, req.headers);
        await this.responseHandler.handleServiceResponse(req, res, returnData);
    }

    // Confirm signup controller
    async confirmSignup(req, res, next) {
        const returnData = await this.authService.confirmSignupService(req.user);
        await this.responseHandler.handleServiceResponse(req, res, returnData);
    }
}

module.exports = authController;