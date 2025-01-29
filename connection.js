var mysql=require("mysql");
var util=require("util");
var conn=mysql.createConnection({
    "host":"btaadmbkjzqdotolsxf4-mysql.services.clever-cloud.com",
    "user":"uop2n5ihjxah9mnj",
    "password":"uop2n5ihjxah9mnj",
    "database":"btaadmbkjzqdotolsxf4"
})
var exe=util.promisify(conn.query).bind(conn);
module.exports=exe;
