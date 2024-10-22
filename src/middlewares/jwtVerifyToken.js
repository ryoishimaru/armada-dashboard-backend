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
        const decoded = Jwt.verify(token, secretKey);
        req.user = decoded;
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