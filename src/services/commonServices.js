import BaseModel from '~/models/BaseModel';
import commonHelpers from '~/helpers/commonHelpers';
import axios from "axios";

const baseModelObj = new BaseModel();

export class commonServices {

    /*
     *check valid user login after jwt token validate then check user with divice id 
     */
    async checkValidUserLogin(req, tableName) {
        try {

            let userId, deviceId, isExist;
            
            userId = await commonHelpers.decrypt(req.user.user_id);
           
            req.user.user_id = userId;
            
            deviceId = req.user.device_id;
            
            // set condition for valid login.
            let query = {
                'id': userId,
                'deviceId': deviceId
            }
            
            isExist = await baseModelObj.checkUserExistWithDevice(query, tableName);
            
            
            // check if user not found with current divice set response for false
            if (isExist === undefined) {
                return false;
            }
            // return true if user found
            return true;

        } catch (error) {
            return false;
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
}