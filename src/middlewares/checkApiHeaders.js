require('dotenv').config();
import commonConstants from '~/constants/commonConstants';
import commonHelpers from '~/helpers/commonHelpers';

/**
 * User authentication.
 *
 * @param  {Object} req Request.
 * @param  {Object} res Response.
 * @param  {Object} next Next request.
 */
const checkApiHeaders = async (req, res, next) => {

    const api_key = process.env.API_KEY;

    // return if API KEY not set in env
    if (!api_key) {
        throw new Error('API_KEY is not defined in the env file');
    }

    const requiredHeaders = [
        { key: "api-key", message: "api access key is missing." }
    ];
    
    const errorArray = [];
    let headerMissing = false;
    
    requiredHeaders.forEach(header => {
        if (!req.headers[header.key] || req.headers[header.key] === "") {
            headerMissing = true;
            errorArray.push(header.message);
        }
    });
    
    if (headerMissing) {
        const responseObj = {
            "code": commonHelpers.getResponseCode('MISSING_HEADERS'),
            "errors": errorArray
        };
        return res.status(400).json(responseObj);
    }

    const apiAccessKey = req.headers["api-key"];

    // check api access key
    if (api_key != apiAccessKey) {
        const responseObj = {"code": commonHelpers.getResponseCode('INVALID_API_KEY')};
        return res.status(401).json(responseObj);
    }
    next();
};

module.exports = checkApiHeaders;