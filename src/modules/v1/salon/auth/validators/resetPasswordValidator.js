import validateSchema from '~/utils/validate'

// create schema for reset password api
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
    required: ["email"], //set required paramenter
    additionalProperties: true, //make addition parameter allow in request body by makeing additionalProperties =true 
}


// reset password field validation 
export const resetPasswordValidator = function(req, res, next) {

    const isValid = validateSchema(req, schema);
    //check if isvalid status false return validation response
    if (!isValid.status) {
        // return response 
        return res.status(isValid.status_code).json(isValid.error);
    }
    next();
}