var mysql=require("mysql");
var util=require("util");
var conn=mysql.createConnection({
    "host":"bv26vzxlbhsdgcngogll-mysql.services.clever-cloud.com",
    "user":"uzw7nxvwjugsqlap",
    "password":"mQwUoMR8xvheL5F51W0u",
    "database":"bv26vzxlbhsdgcngogll"
})
var exe=util.promisify(conn.query).bind(conn);
module.exports=exe;
