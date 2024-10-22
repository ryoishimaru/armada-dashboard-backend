import validateSchema from '~/utils/validate'

// create schema for add product api
const schema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
            maxLength: 60,
            errorMessage: {
                type: 'The product name field must be a string',
                minLength: 'Must have required property product name.',
                maxLength: 'Product name may have maximum 100 characters.'
            }, 
        },
        detailedName: {
            type: "string",
            minLength: 1,
            errorMessage: {
                type: 'The detailed name field must be a string',
                minLength: 'Must have required property detailed name.',
                maxLength: 'Detailed name may have maximum 150 characters.'
            }, 
        },
        minPrice: {
            type: "string",
            pattern: "^[0-9]{1,8}(\\.[0-9]{1,2})?$",
            errorMessage: {
                type: 'The min price field must be a string',
                pattern: 'Min price must be a valid decimal value with up to 10 digits and 2 decimal places.'
            }, 
        },
        maxPrice: {
            type: "string",
            pattern: "^[0-9]{1,8}(\\.[0-9]{1,2})?$",
            errorMessage: {
                type: 'The max price field must be a string',
                pattern: 'Max price must be a valid decimal value with up to 10 digits and 2 decimal places.'
            }, 
        },
        htmlFileName: {
            type: "string",
            maxLength: 100,
            errorMessage: {
                type: 'The html file name field must be a string',
                maxLength: 'Html file name may have maximum 100 characters.'
            }, 
        }
    },

    required: ["name","detailedName","minPrice","maxPrice","htmlFileName"], //set required paramenter
    additionalProperties: true, //make addition parameter allow in request body by makeing additionalProperties =true 
}

// admin's add product field's validation 
export const addProductValidator = function(req, res, next) {

    const isValid = validateSchema(req, schema);
    // Check if isValid.status is false and return validation response
    if (!isValid.status) {
        return res.status(isValid.status_code).json(isValid.error);
    }
    next();
};