var crypto = require('crypto');
var generator = require('generate-password');
const CryptoJS = require('crypto-js');
const { v4: uuidv4 } = require('uuid');
const NodeCache = require('node-cache');
const myCache = new NodeCache();
const SftpClient = require('ssh2-sftp-client');

import Path from 'path';
import logger from '~/utils/logger';
import FileUpload from '~/libraries/FileUpload';
import StatusCodes from 'http-status-codes';
import Hashids from 'hashids';
import jwt from 'jsonwebtoken';
import commonConstants from '~/constants/commonConstants';
import responseCodeConstant from '~/constants/responseCodeConstant';
import JwtAuthSecurity from '~/libraries/JwtAuthSecurity';
import baseModel from '~/models/BaseModel';

const JwtAuthSecurityObj = new JwtAuthSecurity(),
  baseModelObj = new baseModel();
const FileUploads = new FileUpload();

// Creating hashids object with hash length of 6
const hashidObj = new Hashids('', 6),
  util = require('util'),
  verifyJwt = util.promisify(jwt.verify);

// Get a encrypted string.
const encrypt = function (text) {
  return hashidObj.encode(text);
};

// Get a decrypted string.
const decrypt = function (text) {
  const output = hashidObj.decode(text);
  return output.length === 0 ? 0 : output[0];
};

// get random number between 1000 to 9999
const getOtp = function () {
  // set minimum and maximum range
  const range = { min: 1000, max: 9999 },
    delta = range.max - range.min;

  // get random number using math function
  var randomNumber = Math.round(range.min + Math.random() * delta);

  return randomNumber;
};

async function verifyJwtTokenData(tokenData) {
  try {
    const secretKey = process.env.JWT_SECRET_KEY;

    if (!secretKey) {
      throw new Error('jwt-secret-key is not defined in the env file');
    }
    return await verifyJwt(tokenData, secretKey);
  } catch (error) {
    return false;
  }
}

async function isValidJson(jsonData) {
  try {
    JSON.parse(jsonData);
    return true;
  } catch (e) {
    return false;
  }
}

// Get a encrypt string usign crypto-js.
const encryptWithCrypto = function (text) {
  if (!process.env.CRYPTO_SECRET_KEY) {
    throw new Error('CRYPTO_SECRET_KEY is not defined in the env file');
  }
  return CryptoJS.AES.encrypt(text, process.env.CRYPTO_SECRET_KEY).toString();
};

// Get a decrypted string usign crypto-js.
const decryptWithCrypto = function (encryptedText) {
  if (!process.env.CRYPTO_SECRET_KEY) {
    throw new Error('CRYPTO_SECRET_KEY is not defined in the env file');
  }
  return CryptoJS.AES.decrypt(
    encryptedText,
    process.env.CRYPTO_SECRET_KEY
  ).toString(CryptoJS.enc.Utf8);
};

/**
 *
 * @param {*} userData
 * @returns get login response
 */
async function getLoginResponse(userData) {
  const { id, salonCode } = userData;

  // encrypt the user id
  const encryptUserId = encrypt(id);

  const tokenData = {
    user_id: encryptUserId,
    ...(salonCode && { salon_code: salonCode }),
  };

  const response = {
    token: await JwtAuthSecurityObj.generateJwtToken(tokenData),
  };

  return response;
}

// Helper function to generate a 32-byte key from a secret key
function generateKeyFromSecretKey(secretKey) {
  return crypto.pbkdf2Sync(secretKey, '', 100000, 32, 'sha256');
}

// Helper function to encrypt a message using a secret key
function customEncrypt(value) {
  try {
    const secretKey = process.env.ENCRYPTION_SECRET_KEY;
    if (!secretKey) {
      throw new Error('ENCRYPTION_SECRET_KEY is not defined in the env file');
    }
    const iv = crypto.randomBytes(16); // Initialization Vector
    const key = generateKeyFromSecretKey(secretKey);

    const cipher = crypto.createCipheriv(
      commonConstants.ENCRYPTION_ALGORITHM,
      key,
      iv
    );
    let encrypted = cipher.update(value, 'utf-8', commonConstants.HEX);
    encrypted += cipher.final(commonConstants.HEX);
    return iv.toString(commonConstants.HEX) + encrypted;
  } catch (error) {
    throw new Error('Encryption failed: ' + error.message);
  }
}

// Helper function to decrypt an encrypted message using a secret key
function customDecrypt(encryptedValue) {
  try {
    const secretKey = process.env.ENCRYPTION_SECRET_KEY;
    if (!secretKey) {
      throw new Error('ENCRYPTION_SECRET_KEY is not defined in the env file');
    }
    const iv = Buffer.from(encryptedValue.slice(0, 32), commonConstants.HEX); // Get IV from the first 32 characters
    const encryptedText = encryptedValue.slice(32);
    const key = generateKeyFromSecretKey(secretKey);

    const decipher = crypto.createDecipheriv(
      commonConstants.ENCRYPTION_ALGORITHM,
      key,
      iv
    );
    let decrypted = decipher.update(
      encryptedText,
      commonConstants.HEX,
      'utf-8'
    );
    decrypted += decipher.final('utf-8');
    return { status: true, decrypted };
  } catch (error) {
    return { status: false, message: error.message };
  }
}

// Generate a unique ID
function generateUniqueID() {
  const randomUUID = uuidv4();
  return randomUUID;
}

// get response code
function getResponseCode(key) {
  return responseCodeConstant[key];
}

// Generate random password.
function getRandomPassword() {
  return generator.generate({
    length: 8,
    numbers: true,
    uppercase: true,
    lowercase: true,
    symbols: '#$%^&*@!',
    strict: true,
  });
}

async function updateHeaderInfo(requestHeaders, query, tableName) {
  try {
    const device_id = requestHeaders['device-id'];
    const device_token = requestHeaders['device-token'];
    const device_type = requestHeaders['device-type'];

    const updatedEmptyHeader = {
        deviceId: null,
        deviceToken: null,
      },
      whereQuery = requestHeaders['device-id']
        ? { deviceId: requestHeaders['device-id'] }
        : {},
      orwhereQuery = requestHeaders['device-token']
        ? { deviceToken: requestHeaders['device-token'] }
        : {};

    await baseModelObj.updateHeader(
      updatedEmptyHeader,
      whereQuery,
      orwhereQuery,
      tableName
    );

    //update new device-id,device-type,device-token
    const updatedHeader = {
      deviceId: device_id,
      deviceToken: device_token,
      deviceType: device_type,
    };

    await baseModelObj.updateObj(updatedHeader, query, tableName);
  } catch (error) {
    console.log(error);
    return error;
  }
}

/**
 * This function handles empty values by returning null if the value is an empty string or undefined,
 * otherwise it returns the original value
 */
function handleEmptyValue(value) {
  return value === '' || value === undefined ? null : value;
}

async function prepareResponse(statusCode, messageCode, response) {
  // If response is undefined or null, set an empty object as responseObj, otherwise use the provided response
  const responseObj = !response ? {} : response;

  // Construct and return the response object with status code, message code, and response data
  return {
    status_code: statusCode,
    code: getResponseCode(messageCode), // Use the getResponseCode function to obtain the appropriate code
    response: responseObj,
  };
}

// Function to handle file upload
async function handleFileUpload(file, existingFile, fileValidations) {
  if (file) {
    // Checking image size
    if (Math.round(file.size) >= fileValidations.maxAllowFileSize) {
      throw {
        status_code: StatusCodes.BAD_REQUEST,
        code: await this.getResponseCode(fileValidations.sizeLimitResponseCode),
      };
    }

    // Checking extension
    const extensionName = Path.extname(file.name).toLowerCase(),
      allowedExtention = fileValidations.allowExtensions;

    if (!allowedExtention.includes(extensionName)) {
      throw {
        status_code: StatusCodes.BAD_REQUEST,
        code: await this.getResponseCode(fileValidations.extentionResponseCode),
      };
    }

    try {
      const returnData = await FileUploads.uploadFile(
        file,
        fileValidations.fileUploadPath
      );
      if (existingFile) {
        await FileUploads.unlinkFile(
          existingFile,
          fileValidations.fileUploadPath
        );
      }
      return returnData.name;
    } catch (err) {
      logger.error(err);
    }
  }
  if (existingFile) {
    await FileUploads.unlinkFile(existingFile, fileValidations.fileUploadPath);
  }
  return '';
}
/**
 * Set a value in the cache
 * @param {string} key - The key to store the value under
 * @param {any} value - The value to store
 * @param {number} ttl - Time to live in seconds
 */
const setCacheValue = (key, value, ttl = 3600) => {
  myCache.set(key, value, ttl);
};

/**
 * Get a value from the cache
 * @param {string} key - The key to retrieve the value for
 * @returns {any} - The cached value or null if not found
 */
const getCacheValue = (key) => {
  return myCache.get(key);
};

/**
 * Delete a value from the cache
 * @param {string} key - The key to delete
 */
const deleteCacheValue = (key) => {
  myCache.del(key);
};

/**
 * Check if a key exists in the cache
 * @param {string} key - The key to check
 * @returns {boolean} - True if the key exists, otherwise false
 */
const cacheExists = (key) => {
  return myCache.has(key);
};

/**
 * Calculate the price of a product based on its type (regular or subscription).
 * @param {Object} product - The product object containing pricing information.
 * @returns {number} - The calculated price.
 */
export function calculateProductPrice(product) {
  const discountMap = { 1: 10, 2: 15, 3: 20 }; // Example discount rates

  if (product.isSubscribed) {
    const discountRate = discountMap[product.discountRateOnSubscription] || 0;
    return product.sellingPrice * (1 - discountRate / 100);
  }
  return product.sellingPrice;
}

// Upload a file to an SFTP server
const uploadFileToSFTP = async function (localFilePath, remoteFilePath) {
  const config = {
    host: process.env.SFTP_HOST,
    port: process.env.SFTP_PORT,
    username: process.env.SFTP_USER,
    password: process.env.SFTP_PASSWORD,
  };

  const sftp = new SftpClient();

  try {
    // Connect to the SFTP server
    await sftp.connect(config);

    // Upload the file
    await sftp.put(localFilePath, remoteFilePath);

    console.log(`File uploaded successfully to ${remoteFilePath}`);
    return true;
  } catch (error) {
    console.error('Error uploading file to SFTP:', error);
    throw error;
  } finally {
    // Close the SFTP connection
    await sftp.end();
  }
};

const commonHelpers = {
  getOtp,
  encrypt,
  decrypt,
  getLoginResponse,
  verifyJwtTokenData,
  isValidJson,
  encryptWithCrypto,
  decryptWithCrypto,
  customEncrypt,
  customDecrypt,
  generateUniqueID,
  getResponseCode,
  getRandomPassword,
  updateHeaderInfo,
  handleEmptyValue,
  prepareResponse,
  handleFileUpload,
  setCacheValue,
  getCacheValue,
  deleteCacheValue,
  cacheExists,
  uploadFileToSFTP,
  calculateProductPrice,
};

export default commonHelpers;
