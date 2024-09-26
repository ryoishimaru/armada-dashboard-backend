import fs from "fs";
import uniqid from "uniqid";
import commonConstants from "~/constants/commonConstants";
const sharp = require("sharp");

/**
 * File Upload Library
 */
class FileUpload {
  /**
   * Upload File.
   *
   * @param  {Object} fileObject
   * @param  {String} folder
   * @param  {String} forBlog
   * @returns {Boolean}
   */
  async uploadFile(file, directory = "testing", name = "") {
      return new Promise((resolve, reject) => {
        if (file !== "" && file !== null && file !== undefined) {
          const ext = file.name.split(".").pop(),
            absolutePath = commonConstants.STORAGE_PATH + directory,
            fileName = `${uniqid()}.${ext}`;

          // Check Directory
          if (!fs.existsSync(absolutePath)) {
            fs.mkdirSync(absolutePath, { recursive: true });
          }

          const fileNameWithPath = `${absolutePath}/${fileName}`;

          file.mv(fileNameWithPath, (err) => {
            if (err) {
              reject(err);
            } else {
              const output = { name: fileName };
              resolve(output);
            }
          });
        } else {
          const output = { name: "" };
          resolve(output);
        }
      });
  }

  /**
   * Upload File webp.
   *
   * @param  {Object} fileObject
   * @param  {String} folder
   * @returns {Boolean}
   */
  uploadFileWebp(fileObject, folder) {
    return new Promise((resolve, reject) => {
      if (
        fileObject !== "" &&
        fileObject !== null &&
        fileObject !== undefined
      ) {
        const ext = fileObject.name.split(".").pop(),
          directory = commonConstants.STORAGE_PATH + folder,
          fileName = `${uniqid()}.webp`;

        // Check Directory
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }

        const fileNameWithPath = `${directory}/${fileName}`;

        fileObject.mv(fileNameWithPath, (err) => {
          if (err) {
            reject(err);
          } else {
            const originalImagePath = fileNameWithPath,
              thumbDirectory = directory;
            const thumbImagePath = `${thumbDirectory}/${fileName}`;

            /**
             * Crop image in thumb size(300 X 300)
             */
            sharp(originalImagePath)
              .webp({ quality: 25 })
              .toBuffer()
              .then((thumbData) => {
                // Check Directory
                if (!fs.existsSync(thumbDirectory)) {
                  fs.mkdirSync(thumbDirectory, { recursive: true });
                }
                const writeStream = fs.createWriteStream(thumbImagePath);

                // write some data with a base64 encoding
                writeStream.write(thumbData, "base64");

                // the finish event is emitted when all data has been flushed from the stream
                writeStream.on("finish", () => {});
              })
              .catch((error) => {
                reject(error);
              });

            const output = {
              name: fileName,
              path: fileNameWithPath,
              thumbImagePath: thumbImagePath,
            };
            resolve(output);
          }
        });
      } else {
        const output = { name: "" };

        resolve(output);
      }
    });
  }

  /**
   * Upload Multiple Files.
   *
   * @param  {Object} fileObject
   * @param  {String} folder
   * @returns {Boolean}
   */
  uploadMultipleFile(fileObject, folder) {
    const fileArray = [],
    fileObjectLength = fileObject.length;
    let count = 0;
    return new Promise((resolve, reject) => {
      fileObject.map(async (file) => {
        count++;
        const ext = file.name.split(".").pop(),
          directory = commonConstants.STORAGE_PATH + folder,
          fileName = `${uniqid()}.${ext}`;

        // Check Directory
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory);
        }

        const fileNameWithPath = `${directory}/${fileName}`;

        fileArray.push(fileName);
        await file.mv(fileNameWithPath, (err) => {
          if (err) {
            return reject(false);
          } else {
            const originalImagePath = fileNameWithPath,
              thumbDirectory = directory + folderConstants.UPLOAD_THUMB_FOLDER;
            const thumbImagePath = `${thumbDirectory}/${fileName}`;

            /**
             * Crop image in thumb size(300 X 300)
             */
            sharp(originalImagePath)
              .rotate()
              .resize(300, 300)
              .toBuffer()
              .then((thumbData) => {
                // Check Directory
                if (!fs.existsSync(thumbDirectory)) {
                  fs.mkdirSync(thumbDirectory, { recursive: true });
                }
                const writeStream = fs.createWriteStream(thumbImagePath);

                // write some data with a base64 encoding
                writeStream.write(thumbData, "base64");

                // the finish event is emitted when all data has been flushed from the stream
                writeStream.on("finish", () => {});
              })
              .catch((error) => {
                reject(error);
              });

            const output = {
              name: fileName,
              path: fileNameWithPath,
              thumbImagePath: thumbImagePath,
            };

            resolve(output);
          }
        });
        if (count === fileObjectLength) {
          return resolve(fileArray);
        }
      });
    });
  }

  /**
   * File unlink.
   *
   * @param  {Object} fileName
   * @param  {String} folder
   * @returns {Boolean}
   */
  unlinkFile(fileName, folder) {
    const directory = commonConstants.STORAGE_PATH + folder,
      path = `${directory}/${fileName}`;

    fs.unlink(path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      return;
      // file removed
    });
  }

  /**
   * File unlink using file path with name.
   *
   * @param  {String} filePath
   * @returns {Boolean}
   */
  unlinkFileUsingPath(filePath) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);

        return;
      }

      return;
      // file removed
    });
  }
}

module.exports = FileUpload;