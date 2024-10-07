import { StatusCodes } from "http-status-codes";
import tableConstants from '~/constants/tableConstants';
const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

class webManagerService {

    constructor({ webManagerModel, logger, commonHelpers }) {
        this.webManagerModel = webManagerModel;
        this.logger = logger;
        this.commonHelpers = commonHelpers;
    }

    /*
    Deploy To Ftp service
    @requestData request body data
    @requestHeader request header data
    */
    async deployToFtp(requestData, requestHeader) {
        try {
            // Sample request data for shop details
            const requestData = {
                shop_id: 32322,
                shop_name: "New Salonn",
                shop_address: "Tokyo, Japan"
            };
    
            const { shop_id, shop_name, shop_address } = requestData;
    
            // Path to the HTML template folder
            const htmlTemplateFolder = path.join(__dirname, '../../../../../htmlTemplates/html-css_source_file');
            const indexHtmlPath = path.join(htmlTemplateFolder, 'index.html');
    
            // Step 1: Update placeholders in index.html
            let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
            
            // Replace placeholders in HTML with actual shop data
            htmlContent = htmlContent.replace(/<title>.*<\/title>/, `<title>${shop_name}</title>`)
                                      .replace(/<p id="address">.*<\/p>/, `<p id="address">${shop_address}</p>`);
            
            // Write the updated HTML back to the same index.html file
            fs.writeFileSync(indexHtmlPath, htmlContent, 'utf8');
            
            // Step 2: FTP Configuration (using environment variables for FTP details)
            const ftpConfig = {
                host: process.env.FTP_HOST_DEV,
                user: process.env.FTP_USER_DEV,
                password: process.env.FTP_PASSWORD_DEV,
                secure: true
            };
    
            const client = new ftp.Client();
            client.ftp.verbose = true;
    
            // Step 3: Connect to FTP server
            await client.access(ftpConfig);
            console.log('Connected to FTP server');
    
            // Step 4: Create the shop's folder on the server using shop_id
            const remoteShopFolder = `/home/silvermole7/www/${shop_id}`;
            await client.ensureDir(remoteShopFolder); // Create folder if it doesn't exist
    
            // Step 5: Upload the entire htmlTemplates folder to the shop folder on FTP server
            await client.uploadFromDir(htmlTemplateFolder, remoteShopFolder);
    
            // Step 6: Verify upload completion (optional)
            console.log('Folder upload complete');
            
            // Close FTP connection
            await client.close();
    
            return true;
    
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }    
}

module.exports = webManagerService;