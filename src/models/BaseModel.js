import knexConfig from "~/config/knexfile";
import tableConstants from '~/constants/tableConstants';

const db = knexConfig;

/**
 * define base model
 */
class BaseModel {
  /**
   * Get a all rows from table.
   *
   * @param {String} tableName The query to match against.
   */
  fetchAll(tableName = this.table) {
    return db(tableName)
      .select()
      .then((res) => {
        return res;
      });
  }

  /**
   * Get a collection of models matching a given query.
   *
   * @param {Object} query The query to match against.
   * @param {String} tableName The query to match against.
   * @returns {Array} An array holding resultant models.
   */
  fetchObj(query = {}, tableName = this.table) {
    return db(tableName)
      .select()
      .where(query)
      .then((res) => {
        return res;
      });
  }

  /**
   * Get a collection of models matching a given query.
   *
   * @param {Object} query The query to match against.
   * @param {String} tableName The query to match against.
   * @returns {Array} An array holding resultant models.
   */
  fetchJoinObj(
    query = {},
    joinKey,
    joinTable,
    tableKey,
    tableName = this.table
  ) {
    return db(tableName)
      .select(db.raw(`*`))
      .join(joinTable, `${tableName}.${tableKey}`, `${joinTable}.${joinKey}`)
      .where(query)
      .then((res) => {
        return res;
      });
  }

  /**
   * Get a collection of models matching a given query.
   *
   * @param {Object} query The query to match against.
   * @param {String} tableName The query to match against.
   * @returns {Array} An array holding resultant models.
   */
  fetchFirstObj(query = {}, tableName = this.table, queryNot = {}, selectColumns = null) {
    let queryBuilder = db(tableName).select();
    
    // Check if selectColumns parameter is provided
    if (selectColumns) {
      queryBuilder = queryBuilder.select(selectColumns);
    }
  
    return queryBuilder.where(query).whereNot(queryNot).first();
  }

  /**
   * Get a collection of models matching a given query.
   *
   * @param {Object} query The query to match against.
   * @param {Object} opts Options.
   * @param {String} tableName The query to match against.
   * @returns {Array} An array holding resultant models.
   */
  fetchObjWithSingleRecord(query = {}, opts = {}, tableName = this.table) {
    return db(tableName)
      .select(db.raw(opts))
      .where(query)
      .first()
      .then((row) => {
        return row;
      });
  }

  /**
   * Get a collection of models matching a given query.
   *
   * @param {Object} query The query to match against.
   * @param {Object} opts Options.
   * @param {String} tableName The query to match against.
   * @param {Object} orderby
   * @param {Object} order
   * @returns {Array} An array holding resultant models.
   */
  fetchObjWithSelectedFields(
    query = {},
    opts = {},
    tableName = this.table,
    orderby,
    order
  ) {
    let prepareQuery = db(tableName).select(opts).where(query);

    if (orderby !== undefined && order !== undefined) {
      prepareQuery = prepareQuery.orderBy(orderby, order);
    }
    /* prepareQuery = prepareQuery.map((res) => {
      return res;
    }); */

    prepareQuery = prepareQuery.then((res) => {
      return res;
    });

    return prepareQuery;
  }

  /**
   * Get a collection of models matching a given query.
   *
   * @param {Object} query The query to match against.
   * @param {Object} opts Options.
   * @param {String} tableName The query to match against.
   * @param {Object} orderBy Order by.
   * @param {String} order Order.
   * @returns {Array} An array holding resultant models.
   */
  fetchObjWithSelectedFieldsOrderBy(
    query = {},
    opts = {},
    tableName = this.table,
    orderBy,
    order
  ) {
    return db(tableName)
      .select(opts)
      .where(Util.toSnake(query))
      .orderBy(orderBy, order)
      .map((res) => {
        return res;
      });
  }

  /**
   * Get a collection of models matching a given query.
   *
   * @param {Object} query The query to match against.
   * @param {Object} wherein The query to match against.
   * @param {String} tableName The query to match against.
   * @returns {Array} An array holding resultant models.
   */
  fetchObjWhereIn(query = {}, wherein = [], tableName = this.table) {
    let prepareQuery = db(tableName).select().where(query);

    if (wherein.length > 0) {
      prepareQuery = prepareQuery.whereIn("id", wherein);
    }
    prepareQuery = prepareQuery.map((res) => {
      return res;
    });

    return prepareQuery;
  }

  /**
   * Inserts a new model into the database then returns an instantiation of the model.
   *
   * @param {Object} properties The Model properties.
   * @param {String} tableName The query to match against.
   * @returns {*} An instantiation of the model.
   */
  createObj(insertdata, tableName = this.table) {
    let prepareQuery = insertdata;

    return db(tableName).insert(prepareQuery);

    prepareQuery.spread((res) => {
      return res;
    });
  }

  /**
   * Saves the properties currently set on the model.
   *
   * @param {Object} properties The properties to update.
   * @param {Object} query Where clause for updating.
   * @param {String} tableName The query to match against.
   * @returns {Array} A collection of the updated models.
   */
  updateObj(properties, query = {}, tableName = this.table) {
    return db(tableName)
      .update(properties)
      .where(query)
      .then((res) => {
        return res;
      });
  }

  /**
   * Delete the records against query on the model.
   *
   * @param {Object} query Where clause for delete data.
   * @param {String} tableName The Table name to match against.
   * @returns {Array} A collection of the updated models.
   */
  deleteObj(query = {}, tableName = this.table) {
    return db(tableName)
      .where(query)
      .del()
      .then((res) => {
        return res;
      });
  }

  /**
   * Saves the properties currently set on the model.
   *
   * @param {String} tableName The query to match against.
   * @param {Object} query The properties to update.
   * @returns {Array} A collection of the updated models.
   */
  getCount(tableName = this.table, query = {}) {
    return db(tableName)
      .count({
        count: "*",
      })
      .where(query)
      .then((res) => {
        return res[0].count;
      });
  }

  // Query to truncate table
  async truncateTable(tableName) {
    return db
      .raw("SET foreign_key_checks = 0")
      .then(function (res) {
        return db.truncate(tableName).then(function (res) {
          return db.raw("SET foreign_key_checks = 1");
        });
      })
      .catch((err) => {
        return err;
      });
  }

  /*
    * check is email used 
    @query  where condition
    */
  checkIsEmailUsed = (query, table) => {
    if (table === undefined) {
      table = tableConstants.USERS;
    }
    return db(table).select("*").where(query).first();
  };


  /**
   * checking user existance with userID and DeviceId
   * @param {*} query
   * @returns
   */
  async checkUserExistWithDevice(query,tableName) {
    return db(tableName)
    .select('id')
    .where(query)
    .then((res) => {
      return res;
    });
  }

  /**
   * truncate all the tables
   * @returns
   */
  async truncateTables() {
    const queryResult = await db.raw(`CALL truncate_tables()`);
    return queryResult[0];
  }

  /**
   * Asynchronous function to update records in a specified database table.
   *
   * @param {string} tableName - The name of the database table to be updated.
   * @param {Array} ids - An array of identifiers (e.g., primary keys) specifying the records to update.
   * @param {string} columnName - The name of the column representing the identifier in the database table.
   * @param {Object} properties - An object containing the column-value pairs to be updated in the records.
   * @returns {Promise} - A promise representing the completion of the update operation.
   *
   */
  async updateData(tableName, ids, columnName, properties) {
    return this.db(tableName).whereIn(columnName, ids).update(properties);
  }

  /**
   * Asynchronous function to delete records from a specified database table.
   *
   * @param {string} tableName - The name of the database table from which records will be deleted.
   * @param {Array} ids - An array of identifiers (e.g., primary keys) specifying the records to delete.
   * @param {string} columnName - The name of the column representing the identifier in the database table.
   * @returns {Promise} - A promise representing the completion of the delete operation.
   */
  async deleteData(tableName, ids, columnName) {
    return this.db(tableName).whereIn(columnName, ids).del();
  }

/**
* Checks the uniqueness of a value in a specified column of a table, excluding a specific record by ID.
* 
*  @param {string} tableName - The name of the table in which to check for uniqueness.
*  @param {string} columnName - The name of the column to check for uniqueness.
*   @param {} columnValue - The value to check for uniqueness.
*  @returns {Promise<boolean>} - A Promise that resolves to true if the value is unique, otherwise false.
*/
  async checkRecordExist(tableName, columnName, columnValue, excludeColumn = null, excludeValue = null) {

    try {
      // Construct the query to check for the existence of the column value
      let query = db(tableName).where(columnName, columnValue);
      // If an exclude column and value are provided, exclude the record with that column value from the check
      if (excludeColumn !== null && excludeValue !== null) {
        query = query.whereNot(excludeColumn, excludeValue);
      }
      // Retrieve the first matching record
      const result = await query.first();

      // Return data if matching record is found, indicating not unique requested data
      return result;
    } catch (error) {
      // Log any errors that occur during the uniqueness check
      console.log(error);
      // Throw the error to propagate it up to the caller
      throw error;
    }
  }
  
  /*
    Update user header data
    @query where condition
    @orQuery or where condition
    @data updated value 
  */
  updateHeader = (data, query, orQuery, tableName) => {
    return db(tableName)
      .update(data)
      .where(query)
      .orWhere(orQuery)
      .then((res) => {
        return res;
      });
  };
}
export default BaseModel;