import { StatusCodes } from "http-status-codes";
import tableConstants from '~/constants/tableConstants';

/**
 * creating AuthModel object for access the database 
 */
class authService {

    constructor({ saAuthModel, DateTimeUtil, passwordHash, logger, JwtAuthSecurity, commonHelpers }) {
        this.saAuthModel = saAuthModel;
        this.DateTimeUtil = DateTimeUtil;
        this.passwordHash = passwordHash;
        this.logger = logger;
        this.JwtAuthSecurity = JwtAuthSecurity;
        this.commonHelpers = commonHelpers;
    }
    
    /*
    Admin login service
    @requestData request body data
    @requestHeader request header data
    */
    async loginService(requestData, requestHeader) {
        try {
            // set where condition for check exist 
            const where = {
                'email': requestData.email
            };

            // fetch the combination of email and password
            let userData = await this.saAuthModel.fetchObjWithSingleRecord(where, "id,email,password", tableConstants.SUPER_ADMIN);
          
            if (!userData) {
                // user not found response
                return {
                    status_code: StatusCodes.BAD_REQUEST,
                    code: await this.commonHelpers.getResponseCode('INVALID_LOGIN_CREDENTIALS')
                };
            }

            // match hash password and request body password
            const isMatch = this.passwordHash.compareSync(requestData.password, userData.password);
            if (!isMatch) {
                // return response is password not match
                return {
                    status_code: StatusCodes.BAD_REQUEST,
                    code: await this.commonHelpers.getResponseCode('INVALID_LOGIN_CREDENTIALS')
                };
            }
            
            //call helper function to get prepare login response
            const responseData = await this.commonHelpers.getLoginResponse(userData);

            // return login success response
            return {
                status_code: StatusCodes.OK,
                code: await this.commonHelpers.getResponseCode('SUCCESS'),
                response: responseData
            };


        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }
}

module.exports = authService;