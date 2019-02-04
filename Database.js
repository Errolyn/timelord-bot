let mysql = require('mysql');
var logger = require('winston');

let dbConnect = mysql.createConnection(process.env.JAWSDB_URL);

module.exports = {
  createUser(userInfo){
    let sql = 'INSERT INTO Users SET ?'
    dbConnect.query(sql, userInfo, function (err, result, fields) {
      logger.info("Connecting to DB");
      if (err) throw err;
      logger.info("Connected to DB");
      console.log('created a new user: ')
      console.log(result);
    })
  },

  getUser(userName){
    let sql = 'SELECT * FROM Users WHERE userName=?'
    logger.info("Connecting to DB")
    dbConnect.query(sql, userName, function (err, result, fields) {
      if (err) throw err;
      logger.info("Connected to DB");
      // console.log('getUser results are: ')
      // console.log(result[0]);
      return result[0];
    })
  },

  updateUser(id, updates ){
    let sql = `UPDATE Users SET ${updates} WHERE id=${id} `;
    dbConnect.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result.affectedRows + " record(s) updated");
    });
  },
}
