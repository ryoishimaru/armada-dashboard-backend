import validateSchema from '~/utils/validate'

// create schema for login api
const schema = {
    type: "object",
    properties: {
        email: {
            type: "string",
            format: "email",
            errorMessage: {
                format: 'Invalid email format.'
            },
        }
    },
    required: ["email", "password"], //set required paramenter
    additionalProperties: true, //make addition parameter allow in request body by makeing additionalProperties =true 
}


// login field validation 
export const loginValidator = function(req, res, next) {

    const isValid = validateSchema(req, schema);
    //check if isvalid status false return validation response
    if (!isValid.status) {
        // return response 
        return res.status(isValid.status_code).json(isValid.error);
    }
    next();
}