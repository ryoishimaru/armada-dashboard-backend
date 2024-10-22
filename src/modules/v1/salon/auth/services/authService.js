import { StatusCodes } from "http-status-codes";
import tableConstants from '~/constants/tableConstants';
import axios from "axios";

/**
 * creating AuthModel object for access the database 
 */
class authService {

    constructor({ authModel, DateTimeUtil, passwordHash, logger, JwtAuthSecurity, Email, commonHelpers }) {
        this.authModel = authModel;
        this.DateTimeUtil = DateTimeUtil;
        this.passwordHash = passwordHash;
        this.logger = logger;
        this.JwtAuthSecurity = JwtAuthSecurity;
        this.commonHelpers = commonHelpers;
        this.Email = Email;
    }

    /*
    Salon signup service
    @requestData request body data
    @requestQuery request query data
    */
    async signupService(requestData, requestQuery) {
        try {

            const salonCode = requestQuery.code;

            // check if the salon code is provided in the query parameters            
            if (!salonCode) {
                return {
                    status_code: StatusCodes.BAD_REQUEST,
                    code: await this.commonHelpers.getResponseCode('SALON_CODE_REQUIRED')
                };
            }

            // signup functionality
            let wherQuery = { 'email': requestData.email.trim()};
            
            // fetch user email
            let userEmail = await this.authModel.fetchObjWithSingleRecord(wherQuery, "email", tableConstants.SALON);
            
            // if email exist
            if (userEmail!==undefined) {
                return {
                    status_code: StatusCodes.BAD_REQUEST,
                    code: await this.commonHelpers.getResponseCode('EMAIL_EXIST')
                };
            }

            // fetch salon code
            let isSalonCode = await this.authModel.fetchObjWithSingleRecord({salonCode}, "salonCode", tableConstants.SALON);

            // if salon code exist
            if (isSalonCode!==undefined) {
                return {
                    status_code: StatusCodes.BAD_REQUEST,
                    code: await this.commonHelpers.getResponseCode('SALON_CODE_EXIST')
                };
            }
            
            // fetch salon code
            const isValidSalon = await this.validateSalonCodeService(requestQuery.code.trim());
            
            // if the salon code is invalid
            if (!(isValidSalon?.status_code === StatusCodes.OK && isValidSalon?.code === await this.commonHelpers.getResponseCode('SALON_CODE_VALID'))) {
                return {
                    status_code: StatusCodes.BAD_REQUEST,
                    code: await this.commonHelpers.getResponseCode('INVALID_SALON_CODE')
                };
            }

            const tokenPayload = {
              email: requestData.email.trim(),
              salonCode,
              password: await this.passwordHash.cryptPassword(
                requestData.password.trim()
              ),
            };

            const token = this.JwtAuthSecurity.generateJwtToken(tokenPayload);

            const salonObj = {email:requestData.email.trim(), token}; 

            await this.sendConfirmationEmail(salonObj);

            // return signup success response
            return {
                status_code: StatusCodes.OK,
                code: await this.commonHelpers.getResponseCode('SALON_CNF_TOKEN_SENT'),
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

    /*
    Salon Code validation service
    @salonCode salon code to validate
    @return Promise<boolean> whether the salon code is valid or not
    */
    async validateSalonCodeService(salonCode) {
        try {
            // Fetch OAuth 2.0 token
            const token = await this.getOAuthToken();
    
            // Prepare the request body
            const requestBody = {
                "search_options": {
                    "member_code": salonCode.trim()
                },
                "response_options": {
                    "response_type": "json",
                    "charset": "UTF-8"
                }
            };

            // Make the API call to validate salon code
            const response = await axios.post(
                'https://shop.armada-style.com/api/v2/members/search',
                requestBody,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Check if the members array is not empty
            const members = response.data?.response?.members;
            if (response.data.success === 'ok' && Array.isArray(members) && members.length) {
                // Salon code exists
                return {
                    status_code: StatusCodes.OK,
                    code: await this.commonHelpers.getResponseCode('SALON_CODE_VALID'),
                    data: response.data
                };
            } else {
                // Salon code does not exist
                return {
                    status_code: StatusCodes.NOT_FOUND,
                    code: await this.commonHelpers.getResponseCode('INVALID_SALON_CODE')
                };
            }
        } catch (error) {
            this.logger.error(`Unknown Error: ${error.message}`);
            return error;
        }
    }

    /*
    OAuth Token Retrieval Service
    @return Promise<string> OAuth 2.0 access token
    */
    async getOAuthToken() {
        try {
            const tokenUrl = 'https://shop.armada-style.com/api/oauth/token.php';
    
            // Request body for token request
            const tokenRequestData = {
                grant_type: 'client_credentials',
                code: '2322',
                client_id: process.env.RAKU2BBC_CLIENT_ID,
                client_secret: process.env.RAKU2BBC_CLIENT_SECRET
            };
    
            // Make the POST request to fetch the token
            const response = await axios.post(tokenUrl, tokenRequestData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            // Return the access token
            return response.data.access_token;
    
        } catch (error) {
            // Log and handle error
            this.logger.error(`Error fetching OAuth token: ${error.message}`);
            return error;
        }
    }

    /**
    Send Confirmation Email Service
    @param {Object} salonObj - The salon object containing the email and token for the confirmation.
    @returns {Promise<Object>} - Returns the result of the email sending process.
    */
    async sendConfirmationEmail(salonObj) {
        try {
            const confirmationLink = `${process.env.ASSETS_URL_BASE}/salon/v1/confirm-signup?token=${salonObj.token}`;
            /* send verification link start */
            const mail_options = {
                subject: 'Confirmation Link',
                to: [{ address: salonObj.email }],
                template: 'sendConfirmationLink',
                context: {
                    confirmationLink,
                    websiteUrl: process.env.ASSETS_URL_BASE,
                    baseUrl: process.env.ASSETS_URL_BASE
                }
            };

            return await this.Email.sendEmail(mail_options)
            /* send verification link ends */

        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }

    /**
    User Signup Confirmation Service
    @param {Object} reqUser - The user request object containing email, password, and salonCode.
    @returns {Promise<Object>} - Returns the signup response with a status code and result code.
    */
    async confirmSignupService(reqUser,res) {
        try {

            let wherQuery = { 'email': reqUser.email};

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
                email: reqUser.email,
                password: reqUser.password,
                salonCode: reqUser.salonCode,
                createdAt: this.DateTimeUtil.getCurrentTimeObjForDB()
            }

            // create user
            await this.authModel.createObj(userdDataObj, tableConstants.SALON);

            return {
                status_code: StatusCodes.OK,
                code: await this.commonHelpers.getResponseCode('SUCCESS'),
            };
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }

    /*
    Request reset password service
    @requestData request body data
    */
    async requestResetPasswordService(requestData) {
        try {

            // set where condition for check exist 
            const where = {
                'email': requestData.email
            };

            // fetch the email
            let userData = await this.authModel.fetchObjWithSingleRecord(where, "email", tableConstants.SALON);
          
            if (!userData) {
                // user not found response
                return {
                    status_code: StatusCodes.BAD_REQUEST,
                    code: await this.commonHelpers.getResponseCode('EMAIL_DONOT_EXIST')
                };
            }

            // Create a JWT token with user email
            const resetToken = this.JwtAuthSecurity.generateJwtToken({email: userData.email});

            // Generate reset URL (including the JWT token)
            const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

            // Set up email sending
            const mail_options = {
                subject: 'Password Reset Link',
                to: [{ address: userData.email }],
                template: 'sendResetPasswordLink',
                context: {
                    resetUrl,
                    websiteUrl: process.env.ASSETS_URL_BASE,
                    baseUrl: process.env.ASSETS_URL_BASE
                }
            };

            // Send the reset password email
            await this.Email.sendEmail(mail_options)

            // return success response
            return {
                status_code: StatusCodes.OK,
                code: await this.commonHelpers.getResponseCode('SUCCESS'),
            };
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }

    /*
    Reset password service
    @requestData request body data
    */
    async resetPasswordService(reqUser, requestData) {
        try {
            const { newPassword } = requestData;

            // set where condition for check exist 
            const where = {
                'email': reqUser.email
            };

            // fetch the email
            let userData = await this.authModel.fetchObjWithSingleRecord(where, "email", tableConstants.SALON);

            if (!userData) {
            // user not found response
                return {
                    status_code: StatusCodes.BAD_REQUEST,
                    code: await this.commonHelpers.getResponseCode('EMAIL_DONOT_EXIST')
                };
            }

            const cryptedPassword = await this.passwordHash.cryptPassword(newPassword.trim());
            
            await this.authModel.updateObj({password:cryptedPassword},where,tableConstants.SALON);

            // return success response
            return {
                status_code: StatusCodes.OK,
                code: await this.commonHelpers.getResponseCode('SUCCESS'),
            };
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }
}

module.exports = authService;