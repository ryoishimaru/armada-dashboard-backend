/**
 * Common Constants
 *
 * @package                
 * @subpackage             Common Constants
 * @category               Constants
 * @ShortDescription       This is responsible for common constants
 */
require('dotenv').config();
const commonConstants = {
    STORAGE_PATH: "./uploads/",
    DB_DATE_FORMAT: "YYYY-MM-DD HH:mm:ss", // Used in dateTime library
    EMAIL_TEMPLATE_URL: process.env.EMAIL_TEMPLATES || "./src/emails/", // Dynamic email templates path
    PASSWORD_SALT_ROUNDS: 10, // Ensure secure handling
    STATUS: {
        INACTIVE: 0,
        ACTIVE: 1,
        DELETED: 1,
        NOT_DELETED: 0,
        LOGGED_IN: 1
    },
    DEVICE_TYPE: {
        ANDROID: 1,
        IOS: 2,
        WEBSITE: 3,
    },
    DEFAULT_PAGINATION_LIMIT: 10

};

export default commonConstants;