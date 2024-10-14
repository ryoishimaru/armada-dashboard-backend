import { StatusCodes } from "http-status-codes";
import tableConstants from '~/constants/tableConstants';

/**
 * creating AuthModel object for access the database 
 */
class authService {

    constructor({ authModel, DateTimeUtil, passwordHash, logger, JwtAuthSecurity, commonHelpers }) {
        this.authModel = authModel;
        this.DateTimeUtil = DateTimeUtil;
        this.passwordHash = passwordHash;
        this.logger = logger;
        this.JwtAuthSecurity = JwtAuthSecurity;
        this.commonHelpers = commonHelpers;
    }

    /*
    Salon signup service
    @requestData request body data
    @requestHeader request header data
    */
    async signupService(requestData, requestHeader) {
        try {
            // signup functionality
            let wherQuery = { 'email': requestData.email.trim()};
            
            // fetch email
            let getUserEmail = await this.authModel.fetchObjWithSingleRecord(wherQuery, "email", tableConstants.SALON);
            
            // if email exist
            if (getUserEmail !== undefined) {
                return {
                    status_code: StatusCodes.BAD_REQUEST,
                    code: await this.commonHelpers.getResponseCode('EMAIL_EXIST')
                };
            }

            // user signup obj
            const userdDataObj = {
                email: requestData.email.trim(),
                password: await this.passwordHash.cryptPassword(requestData.password.trim()),
                salonCode: requestData.salonCode,
                createdAt: this.DateTimeUtil.getCurrentTimeObjForDB()
            }

            // create user
            const [userId] = await this.authModel.createObj(userdDataObj, tableConstants.SALON);

            let getUserData = await this.authModel.fetchObjWithSingleRecord({id:userId}, "id", tableConstants.SALON);

            // call helper function for get login response
            const responseData = await this.commonHelpers.getLoginResponse(getUserData);

            // return signup success response
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

    /*
    Salon login service
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
            let userData = await this.authModel.fetchObjWithSingleRecord(where, "id,email,password", tableConstants.SALON);
          
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