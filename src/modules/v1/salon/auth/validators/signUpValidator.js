import validateSchema from '~/utils/validate'

// create schema for signup api
const schema = {
    type: "object",
    properties: {
        email: {
            type: "string",
            minLength: 5,
            maxLength: 100,
            format: "email",
            errorMessage: {
                type: 'メールフィールドは文字列でなければなりません',
                minLength: 'メールは最低5文字である必要があります。',
                maxLength: 'メールは最大100文字までです。',
                format: '無効なメール形式です。'
            },
        },
        password: {
            type: "string",
            minLength: 6,
            maxLength: 12,
            pattern: "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[#$%^&*@])",
            errorMessage: {
                type: 'パスワードフィールドは文字列でなければなりません。',
                minLength: 'パスワードは最低6文字である必要があります。',
                maxLength: 'パスワードは最大12文字までです。',
                pattern: 'パスワードには少なくとも1つの大文字、小文字、数字、および特殊文字が含まれている必要があります。'
            },
        }
    },

    required: ["email", "password"], //set required paramenter
    additionalProperties: true, //make addition parameter allow in request body by makeing additionalProperties =true 
};

// SignUp field validation 
export const signUpValidator = function(req, res, next) {
    const isValid = validateSchema(req, schema);
    //check if isvalid status false return validation response
    if (!isValid.status) {
        // return response 
        return res.status(isValid.status_code).json(isValid.error);
    }
    next();
}