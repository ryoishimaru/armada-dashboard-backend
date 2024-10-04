import { StatusCodes } from "http-status-codes";
import tableConstants from '~/constants/tableConstants';
const ftp = require('basic-ftp');

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

            // FTP Configuration
            const ftpConfig = {
                host: "54.252.231.187",
                user: "ec2-user",
                password: "",
                secure: false
            };

            const client = new ftp.Client();
            client.ftp.verbose = true;

            // Connect to FTP server
            await client.access(ftpConfig);
            console.log('Connected to FTP server');


        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }
}

module.exports = webManagerService;