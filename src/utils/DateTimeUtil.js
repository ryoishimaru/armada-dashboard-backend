const moment = require( "moment-timezone" );

/**
 * Static DateTimeUtil class.
 */
class DateTimeUtil {
    /**
     * Helper method to convert current timestamp to postgres timstamp.
     *
     * @returns {Object} The resultant snake_case object.
     */
    getCurrentTimeObjForDB() {
        const currentTime = new Date(),
            format = "YYYY-MM-DD HH:mm:ss";

        return moment( currentTime, format )
            .utc()
            .format( format );
    }

    /**
     * Helper method to add minuts in current timestamp.
     *
     * @param {Object} minutesData
     * @returns {Object} The resultant snake_case object.
     */
    getCurrentWithAddMinutes( minutesData ) {
        const currentTime = new Date(),
            format = "YYYY-MM-DD HH:mm:ss";

        return moment( currentTime, format )
            .add( minutesData, "minutes" )
            .utc()
            .format( format );
    }

    /**
     * Helper method to add minuts in current timestamp.
     *
     * @param {Object} minutesData
     * @returns {Object} The resultant snake_case object.
     */
    getCurrentWithAddMonths( minutesData ) {
        const currentTime = new Date(),
            format = "YYYY-MM-DD HH:mm:ss";

        return moment( currentTime, format )
            .add( minutesData, "months" )
            .utc()
            .format( format );
    }

    /**
     * Helper method to add minuts in current timestamp.
     *
     * @param {Object} yearData
     * @returns {Object} The resultant snake_case object.
     */
    getCurrentWithAddYears( yearData, format = "YYYY-MM-DD" ) {
        const currentTime = new Date();
        return moment( currentTime, format )
            .add( yearData, "years" )
            .utc()
            .format( format );
    }

    /**
     * Helper method to return current timestamp for cron.
     *
     * @returns {Object}
     */
    getCurrentTimeObjForCron() {
        const currentTime = new Date(),
            format = "YYYY-MM-DD HH:mm:ss A";

        return moment( currentTime, format )
            .utc()
            .format( format );
    }

    /**
     * Helper method to get current year.
     *
     * @returns {Object} 
     */
    getCurrentYear() {
        const year = new Date(),
            format = "YYYY";

        return moment( year, format )
            .utc()
            .format( format );
    }

    /**
     * Get a formatted date.
     *
     * @param  {String}  inputDate
     * @param  {String}  format
     * @returns {String}
     */
    changeFormat( inputDate, format ) {
        return moment( inputDate ).format( format );
    }

    /**
     * Helper method to get next year.
     *
     * @returns {Object} 
     */
    getNextYear() {
        const nextYear = new Date(),
            format = "YYYY";

        return moment( nextYear, format )
            .add( 1, "y" )
            .utc()
            .format( format );
    }
}

/**
 * @module
 * @type {DateTimeUtil}
 */
module.exports = DateTimeUtil;
