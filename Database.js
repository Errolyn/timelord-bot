// REMEMBER TO REMOVE THE PASSWORD AND USER BEFORE MERGING

let mysql = require('mysql');

let dbConnect = () => {
  return mysql.createConnection({ // connection object
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

module.exports = {
  createUser(userInfo){
    console.log(userInfo);
    dbConnect().connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
      let sql = 'INSERT INTO Users SET ?'
      dbConnect().query(sql, userInfo, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
      }).end();
    }).end();
  },

  getUser(userName){
    let sql = 'SELECT * FROM Users WHERE userName=?'
    dbConnect().query(sql, userName, function (err, result, fields) {
      if (err) throw err;
      console.log('getUser results are: ')
      console.log(result);
      return result;
    })
  },

  updateUser(id, updates ){
    dbConnect().connect(function(err) {
      if (err) throw err;
      let sql = "UPDATE Users SET ${updates} WHERE id=${id} ";
      dbConnect().query(sql, function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
      });
    });
    dbConnect().end();
  },
}
