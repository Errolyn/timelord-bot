let mysql = require('mysql');
var logger = require('winston');

let dbConnect = mysql.createConnection(process.env.JAWSDB_URL);

module.exports = {

  createUser(userInfo){
    let sql = 'INSERT INTO Users SET ?'
    dbConnect.query(sql, userInfo, function (err, result, fields) {
      logger.info("Connecting to DB");
      if (err) {
        reject(new Error(err));
      } else {
        resolve(result[0]);
      }
    })
  },

  findUser(userName){
    return new Promise(function(resolve, reject) {
      let sql = 'SELECT * FROM Users WHERE userName=?'
      dbConnect.query(sql, userName, function (err, result, fields) {
        logger.info("Connected to DB");
        if (err) {
          reject(new Error(err));
        } else {
          resolve(result[0]);
        }
      })

    })
  },

  // getUser(userName){
  //   let sql = 'SELECT * FROM Users WHERE userName=?'
  //   logger.info("Connecting to DB")
  //   dbConnect.query(sql, userName, function (err, result, fields) {
  //     if (err) throw err;
  //     logger.info("Connected to DB");
  //     return result[0];
  //   })
  // },

  // updateUser(id, updates ){
  //   let sql = `UPDATE Users SET ${updates} WHERE id=${id} `;
  //   dbConnect.query(sql, function (err, result) {
  //     if (err) throw err;
  //     console.log(result.affectedRows + " record(s) updated");
  //   });
  // },
}
