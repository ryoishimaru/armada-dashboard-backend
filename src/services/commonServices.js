import BaseModel from '~/models/BaseModel';
import commonHelpers from '~/helpers/commonHelpers';

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

}