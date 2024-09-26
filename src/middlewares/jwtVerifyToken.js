import Jwt from "jsonwebtoken";
import commonHelpers from '~/helpers/commonHelpers';
import tableConstants from '~/constants/tableConstants';
import commonConstants from '~/constants/commonConstants';
import { commonServices } from "~/services/commonServices";
import BaseModel from '~/models/BaseModel'
const commonServceObj = new commonServices(),
    baseModelObj = new BaseModel();

const jwtVerifyToken = async (req, res, next) => {

    /* get jwt to secret key from env file*/
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
        throw new Error('jwt-secret-key is not defined in the env file');
    }
    
    /*get jwt token from requet*/
    const token =
        req.body.token || req.query.token || req.headers["access-token"];

    /*set error message when token key not found*/
    if (!token) {
        const responseObj = {
            "code": commonHelpers.getResponseCode('ACCESS_TOKEN_REQUIRED'),
        };
        return res.status(403).json(responseObj);
    }

    try {
        /*verify token and add user key in response */
        const decoded = Jwt.verify(token, secretKey);
        
        // fetch device id from DB
        const userId = await commonHelpers.decrypt(decoded.user_id);

        const deviceId = await baseModelObj.fetchObjWithSingleRecord({ 'id': userId }, ['deviceId'], tableConstants.USERS);
        
        // check divice specific check if header divice id and token divice id not match then set invalid token
        if (decoded.device_id != deviceId.deviceId) {
            const responseObj = {
                "code": commonHelpers.getResponseCode('INVALID_TOKEN'),
            };
            return res.status(401).json(responseObj);
        }
        // set user data in request data
        req.user = decoded;
       
        // check user login with current divice id 
        const isValid = await commonServceObj.checkValidUserLogin(req, tableConstants.USERS);

        // if user not login wih current divice id res response for invalid token
        if (!isValid) {

            const responseObj = {
                "code": commonHelpers.getResponseCode('INVALID_TOKEN'),
            };
            return res.status(401).json(responseObj);
        }
    } catch (err) {
        /*return error message when token not valid  */
        const responseObj = {
            "code": commonHelpers.getResponseCode('INVALID_TOKEN'),
        };
        return res.status(401).json(responseObj);
    }

    return next();
};

module.exports = jwtVerifyToken;