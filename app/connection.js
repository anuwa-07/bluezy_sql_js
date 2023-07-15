
const mysql = require('mysql2');

class MakeSQLConnection {
    /**
     * 
     * @param {string} dataBaseName : name of the database
     * @param {string} userName : user name of the database
     * @param {string} password : password of the database
     * @param {string} host : host of the database
     * @param {number} port : port of the database
     */
    constructor(dataBaseName, userName, password, host, port) {
        this.dataBaseName = dataBaseName;
        this.userName = userName;
        this.password = password;
        this.host = host;
        this.port = port;
        this.poolSize = 5;
        this.retryTimeOut = 10000;
    }

    /**
     * This method is used to get the connection to the database.
     * @returns {object} : connection object
     */
    _conInit(isTest = false) {
        // If connection is for testing purpose, will only return the connection object.
        if (isTest) {
            const conn = mysql.createConnection({
                host: this.host,
                user: this.userName,
                password: this.password,
                port: this.port,
                database: this.dataBaseName,
                connectTimeout: this.retryTimeOut
            });
            return conn;
        }
        //
        // If connection is for normal purpose, will return the connection pool.
        const connPool = mysql.createPool({
            host: this.host,
            user: this.userName,
            password: this.password,
            port: this.port,
            database: this.dataBaseName,
            waitForConnections: true,
            connectionLimit: this.poolSize,
            maxIdle: 5,
            queueLimit: 0,
            connectTimeout: this.retryTimeOut
        });
        //
        connPool.on('connection', (conn) => {
            if (!conn) {
                console.log('::[SQL][Error] SQL Connection Failed ::');
                return;
            }
        });
        return connPool;
    }

    /**
     * This method is use to close the connection to the database.
     * @param {object} conn : connection object
     */
    _conClose(conn) {
        conn.end((err) => {
            if (err) {
                console.log('::[SQL][Error] SQL Connection Closed Failed ::');
                return;
            }
        });
    }

    /**
     * This method is used to test the connection to the database.
     */
    testConnection() {
        const conn = this._conInit(true);
        //
        conn.connect((err) => {
            if (err) {
                console.log('::[SQL][Error] Test SQL Connection Failed ::');
                return;
            }
            console.log('::[SQL][Info] Test SQL Connection Established ::');
            this._conClose(conn);
        });
    }
    //

    /**
     * This method is used to execute the SQL query.
     * @param {string} sql : SQL query
     * @param {array} params : parameters for the SQL query
     * @param {function} callback : callback function
     */
    select(sql, params, callback) {
        const conn = this._conInit();
        //
        conn.query(sql, params, (err, results) => {
            if (err) {
                console.log('::[SQL][Error] SQL Select Failed ::');
                return;
            }
            callback(results);
            this._conClose(conn);
        });
    }
}


module.exports = MakeSQLConnection;
