let mysql = require('mysql');
var logger = require('winston');

// another way to handle the DB connection

class Database {
  constructor( dbConnection ) {
    this.connection = mysql.createConnection( dbConnection );
  }
  query( sql, args ) {
    return new Promise( ( resolve, reject ) => {
      this.connection.query( sql, args, ( err, rows ) => {
        if ( err )
          return reject( err );
        resolve( rows );
      });
    });
  }
  close() {
    return new Promise( ( resolve, reject ) => {
      this.connection.end( err => {
        if ( err )
          return reject( err );
        resolve();
      });
    });
  }
}


