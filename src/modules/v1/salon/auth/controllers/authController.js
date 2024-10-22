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
        await this.authService.confirmSignupService(req.user, res);
        await res.redirect('http://localhost:5173/signin');
    }

    // Request reset password controller
    async requestResetPassword(req, res, next) {
        const returnData = await this.authService.requestResetPasswordService(req.body);
        await this.responseHandler.handleServiceResponse(req, res, returnData);
    }

    // Reset password controller
    async resetPassword(req, res, next) {
        const returnData = await this.authService.resetPasswordService(req.user, req.body);
        await this.responseHandler.handleServiceResponse(req, res, returnData);
    }
}

module.exports = authController;