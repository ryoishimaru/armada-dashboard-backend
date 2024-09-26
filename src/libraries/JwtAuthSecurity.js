import jwt from "jsonwebtoken";

class JwtAuthSecurity {
    
    /**
     * generate jwt token 
     *
     * @param {object} user  param
     * @returns {string} jwt token
     */
    generateJwtToken(user) {
        try {
            /* Get JWT expiration time from the environment variable */
            const expiresIn = process.env.JWT_EXPIRE_TIME || '90d';
           
            /* Get JWT secret key from the environment variable */
            const secretKey = process.env.JWT_SECRET_KEY;
            if (!secretKey) {
                throw new Error('jwt-secret-key is not defined in the env file');
            }

            /* Clone user data */
            const userKeys = JSON.parse(JSON.stringify(user));

            /* Generate JWT token */
            const token = jwt.sign(userKeys, secretKey, {
                expiresIn,
            });

            return token;
        } catch (error) {
            console.error('Error generating JWT token:', error);
            return error;
        }

    }
}

module.exports = JwtAuthSecurity;