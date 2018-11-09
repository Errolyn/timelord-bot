let mysql = require('mysql');

var db = mysql.createConnection({
  host: "ol5tz0yvwp930510.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "c2dwcsup82olwfwh",
  password: "apj6ewe5bklkxa8d",
  database: "ns8wn2un545ig1ij"
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "CREATE TABLE customers (name VARCHAR(255), address VARCHAR(255))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});