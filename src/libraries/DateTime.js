import moment from "moment";
import commonConstants from "~/constants/commonConstants";

/**
 * define DateTime Library
 */
export class DateTime {

    /**
     * Conver UTC time to any local time.
     *
     * @param  {String}  time  Format - YYYY-MM-DD HH:mm:ss.
     * @param  {String}  timezone
     * @param  {String}  format
     * @returns {String}
     */
    utcToAnyTimezone(time, timezone, format) {
        const convertedTime = this.changeFormat(time, commonConstants.DB_DATE_FORMAT);

        return moment
            .utc(convertedTime)
            .tz(timezone)
            .format(format);
    }

    /**
     * Conver local time to UTC time.
     *
     * @param  {String}  time Format - YYYY-MM-DD HH:mm:ss.
     * @param  {String}  timezone
     * @param  {String}  format
     * @returns {String}
     */
    localToUtc(time, timezone, format) {
        const convertedTime = this.changeFormat(time, commonConstants.DB_DATE_FORMAT);

        return moment
            .tz(convertedTime, format, timezone)
            .utc()
            .format(format);
    }

    /**
     * Get a difference between two time.
     *
     * @param  {String}  startTime Format - YYYY-MM-DD HH:mm:ss.
     * @param  {String}  endTime Format - YYYY-MM-DD HH:mm:ss.
     * @param  {String}  type Can be (hours, minutes, weeks, days).
     * @returns {String}
     */
    getDifference(startTime, endTime, type) {
        const start = moment(this.changeFormat(startTime, commonConstants.DB_DATE_FORMAT)),
            end = moment(this.changeFormat(endTime, commonConstants.DB_DATE_FORMAT));

        return moment.duration(end.diff(start)).as(type);
    }

    /**
     * Get a formatted date.
     *
     * @param  {String}  inputDate
     * @param  {String}  format
     * @returns {String}
     */
    changeFormat(inputDate, format) {
        return moment(inputDate).format(format);
    }

    /**
     * Retrun total dureation in string format from current time.
     *
     * @param  {String}  inputDate
     * @returns {String}
     */
    getTotalDurationFromNow(inputDate) {
        return moment(inputDate).fromNow();
    }

    /**
     * Append days in Date.
     *
     * @param  {String}  startDate
     * @param  {String}  duration
     * @param  {String}  type
     * @returns {String}
     */
    appendDaysInDate(startDate, duration, type) {
        const startdate = moment(this.changeFormat(startDate, commonConstants.DB_DATE_FORMAT));

        return moment(startdate)
            .add(duration, type)
            .format(commonConstants.DB_DATE_FORMAT);
    }

    /**
     * Change Timestamp format get from database.
     *
     * @param  {Object} DTObject
     * @param  {string} columnName
     * @param  {string} format
     * @returns {Object}
     */
    changeDatabaseTimestampFormat(DTObject, columnName, format) {
        return Promise.all(
            DTObject.map((keys) => {
                keys[columnName] = this.changeFormat(keys[columnName], format);

                return keys;
            })
        );
    }
}