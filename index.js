var express = require("express");
var user_route = require("./routes/user_route");
var admin_route = require("./routes/admin_route");
require("dotenv").config();
var bodyparser = require("body-parser");
var upload = require("express-fileupload");
var session = require("express-session");
var app = express();

app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(upload());
app.use(session({
    secret: "234567",
    saveUninitialized: true,
    resave: true
}));

// Routing setup
app.use("/admin", admin_route);
app.use("/",user_route);
app.use(function(req,res){
    res.render('404.ejs')
})
app.listen(process.env.PORT || 1000);
