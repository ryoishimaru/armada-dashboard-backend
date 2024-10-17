import validateSchema from '~/utils/validate'

// create schema for update password api
const schema = {
    type: "object",
    properties: {
        newPassword: {
            type: "string",
            minLength: 6,
            maxLength: 12,
            pattern: "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[#$%^&*@])",
            errorMessage: {
                type: 'The password field must be a string.',
                minLength: 'Password should have minimum 6 characters.',
                maxLength: 'Password should be a maximum of 12 characters.',
                pattern: 'Password must contain at least one uppercase, lowercase, number, and a special character.'
            },
        }
    },
    required: ["newPassword"], //set required paramenter
    additionalProperties: true, //make addition parameter allow in request body by makeing additionalProperties =true 
}


// update password field validation 
export const updatePassworddValidator = function(req, res, next) {

    const isValid = validateSchema(req, schema);
    //check if isvalid status false return validation response
    if (!isValid.status) {
        // return response 
        return res.status(isValid.status_code).json(isValid.error);
    }
    next();
}