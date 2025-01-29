var express=require("express");
var url=require("url");
var exe=require("./../connection");
const { console } = require("inspector");
var router=express.Router();

function CheckLogin(req, res, next) {
    if (req.session.user_id) {
        next();
    } else {
        // Redirect to the previous page with a query parameter
        const referrer = req.headers.referer || '/'; // Fallback to home page if no referrer
        res.redirect(`${referrer}?open_login_modal`);
    }
}

function is_login(req){
    if(req.session.user_id)
    {
        return true;
    }
    else
    {
     return false;   
    }
}
// function CheckLogin(req, res, next) {
//     // Permanently set user_id to 2 for the session
//     req.session.user_id = 2;

//     // Proceed to the next middleware or route handler
//     next();
// }


router.get("/", async function(req,res){
    var footer_data=await exe(`SELECT * FROM footer_data`);
    var navbar=await exe(`SELECT * FROM navbar_logo`);
    var data=await exe(`SELECT * FROM category`);
    var products = await exe(`SELECT * FROM products ORDER BY product_id DESC`);
    var obj={"cats":data,"products":products,"is_login":is_login(req),"footer_data":footer_data[0],"logo":navbar[0]};

    res.render("user/index.ejs",obj);

    
});
router.get("/blog",async function(req,res){
    var footer_data=await exe(`SELECT * FROM footer_data`);
    var navbar=await exe(`SELECT * FROM navbar_logo`);
    var data=await exe(`SELECT * FROM category`);
    var obj={"cats":data,"is_login":is_login(req),"logo":navbar[0],"footer_data":footer_data[0]};
    res.render("user/blog.ejs",obj);
});
router.get("/blog-detail",async function(req,res){
    var footer_data=await exe(`SELECT * FROM footer_data`);
    var navbar=await exe(`SELECT * FROM navbar_logo`);
    var data=await exe(`SELECT * FROM category`);
    var obj={"cats":data,"is_login":is_login(req),"logo":navbar[0],"footer_data":footer_data[0]};
    res.render("user/blog-detail.ejs",obj);
});

router.get("/about-us",async function(req,res){
    var footer_data=await exe(`SELECT * FROM footer_data`);
    var navbar=await exe(`SELECT * FROM navbar_logo`);
    var data=await exe(`SELECT * FROM category`);
    var obj={"cats":data,"is_login":is_login(req),"logo":navbar[0],"footer_data":footer_data[0]};
    res.render("user/about-us.ejs",obj);
})
router.get("/service",function(req,res){
    res.render("user/service.ejs");
});
router.get("/gallery",function(req,res){
    res.render("user/gallery.ejs");
});
router.get("/testimonial",function(req,res){
    res.render("user/testimonial.ejs");
});
router.get("/team",function(req,res){
    res.render("user/team.ejs");
})
router.get("/contact-us",async function(req,res){
    var navbar=await exe(`SELECT * FROM navbar_logo`);
    var footer_data=await exe(`SELECT * FROM footer_data`);

    var data=await exe(`SELECT * FROM category`);
    var obj={"cats":data,"is_login":is_login(req),"logo":navbar[0],"footer_data":footer_data[0]};
    res.render("user/contact-us.ejs",obj);
});
router.get("/faq",async function(req,res){
    var navbar=await exe(`SELECT * FROM navbar_logo`);
    var footer_data=await exe(`SELECT * FROM footer_data`);

    var data=await exe(`SELECT * FROM category`);
    var obj={"cats":data,"is_login":is_login(req),"logo":navbar[0],"footer_data":footer_data[0]};
    res.render("user/faq.ejs",obj);
});
router.get("/products",async function(req,res){
    var navbar=await exe(`SELECT * FROM navbar_logo`);
    var footer_data=await exe(`SELECT * FROM footer_data`);

    var data = await exe(`SELECT * FROM category`);
    var url_data = url.parse(req.url, true).query;
    var condition = "";
    if (url_data.product_type && url_data.category_id) {
        condition = `WHERE product_type='${url_data.product_type}' AND product_category_id='${url_data.category_id}'`;
    } else if (url_data.product_type) {
        condition = `WHERE product_type='${url_data.product_type}'`;
    } else if (url_data.category_id) {
        condition = `WHERE product_category_id='${url_data.category_id}'`;
    }
        var products = await exe(`SELECT * FROM products ${condition}`);
        var sql=`SELECT * FROM products `+condition;
        var products=await exe(sql);
        var obj={"cats":data,"products":products,"is_login":is_login(req),"logo":navbar[0],"footer_data":footer_data[0]};
        res.render("user/products.ejs",obj);
    
});
router.get("/product_details/:id",async function(req,res){
    var navbar=await exe(`SELECT * FROM navbar_logo`);
    var footer_data=await exe(`SELECT * FROM footer_data`);

    var data=await exe(`SELECT * FROM category`);
    var product_info=await exe(`
        SELECT * FROM products,category,brands 
        WHERE products.product_category_id =category.category_id
            AND products.product_brand_id = brands.brand_id 
            AND product_id = '${req.params.id}'`);  
            var in_cart=await exe(`SELECT * FROM cart WHERE product_id ='${req.params.id}' AND user_id ='${req.session.user_id}' `);      
    var obj={"cats":data,"product_info":product_info[0],"in_cart":in_cart,"is_login":is_login(req),"logo":navbar[0],"footer_data":footer_data[0]};
    res.render("user/product_details.ejs",obj);
});
router.post("/save_in_cart",CheckLogin,async function(req,res){

    var user_id = req.session.user_id;
    var d = req.body;
    
    var sql = `INSERT INTO cart(user_id, product_id, size, quantity) VALUES (?, ?, ?, ?)`;
    var data = await exe(sql, [user_id, d.product_id, d.size, d.quantity]);
    
    // Redirect to a specific page after successful insertion
    res.redirect(req.headers.referer || '/cart'); // Redirect back to the previous page or cart page as a fallback
    
});
router.get("/cart",CheckLogin,async function(req,res){
    var navbar=await exe(`SELECT * FROM navbar_logo`);
    var footer_data=await exe(`SELECT * FROM footer_data`);

    var products= await exe(`SELECT * FROM cart,products, user_accounts
        WHERE 
        cart.user_id = user_accounts.user_id
        AND cart.product_id= products.product_id
        AND cart.user_id ='${req.session.user_id}'`);
    var data=await exe(`SELECT * FROM category`);
    var obj={"cats":data,"products":products,"is_login":is_login(req),"logo":navbar[0],"footer_data":footer_data[0]};
    res.render("user/cart.ejs",obj);
});
router.get("/delete_cart/:id",CheckLogin,async function(req,res){
        var id= req.params.id;
        var user_id=req.session.user_id;
        var sql=`DELETE FROM cart WHERE cart_id='${id}' AND user_id='${user_id}'`;
        var data=await exe(sql);
        res.redirect("/cart");

});
router.post("/update_cart_qty",async function(req,res){
    var d=req.body;
    var sql=`UPDATE cart SET quantity = '${d.new_qty}' WHERE cart_id ='${d.cart_id}'`;
    var data=await exe(sql);
    var sql2=`SELECT SUM(products.product_price * cart.quantity) as all_total FROM cart,products,user_accounts WHERE cart.user_id = user_accounts.user_id 
    AND cart.product_id = products.product_id 
    AND cart.user_id = '${req.session.user_id}'`;
    var data=await exe(sql2);
    res.send(data[0]);
})

// user account 
router.post("/save_account",async function(req,res){
    var d=req.body;
    var sql=`INSERT INTO user_accounts(user_name ,email, mobile, password ) VALUES ('${d.user_name}' ,'${d.email}', '${d.mobile}', '${d.password}' )`;
    var data=await exe(sql);
    res.redirect("/")
});
router.post("/proceed_to_login", async function (req, res) {
        const d = req.body;
        const sql = `SELECT * FROM user_accounts WHERE email = ? AND password = ?`;
        const data = await exe(sql, [d.email, d.password]);
        if (data.length > 0)


        {
            const user_id = data[0].user_id;
            req.session.user_id = user_id;
            
            // Redirect back to the referrer while removing '?open_login_modal' from the URL
            const referrer = req.headers.referer ? req.headers.referer.replace(/\?open_login_modal/g, '') : '/';
            res.redirect(referrer);
            
        }
         else
        {
            const referrer = req.headers.referer || '/'; 
            res.redirect(`${referrer}?open_login_modal`);
        }
    
});
router.get("/check_out",CheckLogin,async function(req,res){
    var navbar=await exe(`SELECT * FROM navbar_logo`);
    var footer_data=await exe(`SELECT * FROM footer_data`);

    var sql=`SELECT SUM(products.product_price  * cart.quantity ) as total FROM products,cart WHERE cart.product_id = products.product_id AND  cart.user_id ='${req.session.user_id}'`;
    var total= await exe(sql);
    var data=await exe(`SELECT * FROM category`);
    var obj={"cats":data,"total":total[0]['total'],"is_login":is_login(req),"logo":navbar[0],"footer_data":footer_data[0]};
    res.render("user/check_out.ejs",obj);
});
router.post("/confim_order",CheckLogin,async function(req,res){
    var user_id=req.session.user_id;
    var sql=`SELECT * FROM cart, products WHERE cart.product_id = products.product_id AND user_id ='${user_id}'`;
    var d=req.body;
    d.order_date=new Date().toISOString().slice(0,10);
    d.payment_staus="pending";
    d.transaction_id="";
    d.user_id=user_id;
    var sql2=`SELECT SUM(products.product_price  * cart.quantity ) as total FROM products,cart WHERE cart.product_id = products.product_id AND  cart.user_id ='${req.session.user_id}'`;
    var ttl=await exe(sql2);
    d.total=ttl[0]['total'];
    var sql3=`INSERT INTO order_info(full_name ,mo_no,  street_landmark  , city , district , state , country , pincode  , payment_type , order_date  , payment_staus , transaction_id , user_id  , total ,order_status)  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    var data=await exe(sql3,[d.full_name,d.mo_no,d.street_landmark,d.city,d.district,d.state,d.country,d.pincode,d.payment_type,d.order_date,d.payment_staus,d.transaction_id,d.user_id,d.total,"pending"]);
    var products=await exe(sql);
    var order_id=data.insertId;

    products.map(async(row,i)=>{
        prod=[];
        prod[0]=user_id;
        prod[1]=order_id;
        prod[2]=row.product_id;
        prod[3]=row.quantity;
        prod[4]=row.product_price;
        prod[5]=row.product_price * row.quantity;  
        var sql4=`INSERT INTO order_products(user_id,order_id,product_id,quantity,price,total) VALUES(?,?,?,?,?,?)`;
        var data=await exe(sql4,prod);
    });

    // Delete products from the cart
    var delete_cart = `DELETE FROM cart WHERE user_id ='${user_id}'`;
    await exe(delete_cart);


    if(req.body.payment_type == 'online')
    {
        res.redirect("/do_payment/"+order_id);
    }
    else
    {
        res.redirect("/my_orders");
    }
});

router.post("/payment_successs/:id",CheckLogin,async function(req,res){
    var order_id=req.params.id;
    var sql=`UPDATE order_info SET payment_staus ='paid' , transaction_id='${req.body.razorpay_payment_id}' WHERE order_id ='${order_id}'`;
    var data=await exe(sql);
    res.redirect("/my_orders");
});

router.get("/my_orders",CheckLogin,async function(req,res){
    var navbar=await exe(`SELECT * FROM navbar_logo`);
    var footer_data=await exe(`SELECT * FROM footer_data`);

    var sql=`SELECT * FROM order_info WHERE user_id ='${req.session.user_id}'`;
    var orders=await exe(sql);
    var data=await exe(`SELECT * FROM category`);
    var obj={"cats":data,"orders":orders,"is_login":is_login(req),"logo":navbar[0],"footer_data":footer_data[0]};
    res.render("user/my_orders.ejs",obj);
});

router.get("/do_payment/:id",async function(req,res){
    var navbar=await exe(`SELECT * FROM navbar_logo`);
    var footer_data=await exe(`SELECT * FROM footer_data`);

    var order_id=req.params.id;
    var order_info=await exe(`SELECT * FROM order_info WHERE order_id ='${order_id}'`);
    var obj={"order_info":order_info[0],"is_login":is_login(req),"logo":navbar[0],"footer_data":footer_data[0]};
    res.render("user/do_payment.ejs",obj);
});

router.get("/print_invoice/:id",async function(req,res){
    var navbar=await exe(`SELECT * FROM navbar_logo`);
    var footer_data=await exe(`SELECT * FROM footer_data`);

    var data=await exe(`SELECT * FROM category`);
    var obj={"cats":data,"logo":navbar[0],"footer_data":footer_data[0]}
    res.render("user/print_invoice.ejs",obj);
});

// CREATE TABLE order_info(order_id INT PRIMARY KEY AUTO_INCREMENT , full_name VARCHAR(100), street_landmark TEXT , city TEXT, district TEXT, state TEXT, country TEXT, pincode INT , payment_type VARCHAR(100), order_date DATE , payment_staus TEXT, transaction_id TEXT, user_id TEXT , total INT )

// router.get("/kids",async function(req,res){
//     var data=await exe(`SELECT * FROM category`);
//     var obj={"cats":data,"is_login":is_login(req)};
//     res.render("user/kids.ejs",obj);
// })
router.post("/save_contact_info",async function(req,res){
    var date=new Date().toISOString().slice(0,10);
    var current_time=new Date().toLocaleTimeString();
    var d=req.body;
    d.contact_us_info_name=d.contact_us_info_name.replaceAll("'","\\'");
    d.contact_us_info_email=d.contact_us_info_email.replaceAll("'","\\'");
    d.contact_us_info_mobile=d.contact_us_info_mobile.replaceAll("'","\\'");
    d.contact_us_info_message=d.contact_us_info_message.replaceAll("'","\\'");
    var sql=`INSERT INTO contact_user_info(contact_us_info_name, contact_us_info_email, contact_us_info_mobile, contact_us_info_message,contact_us_info_date,contact_us_info_time) VALUES ('${d.contact_us_info_name}', '${d.contact_us_info_email}', '${d.contact_us_info_mobile}', '${d.contact_us_info_message}', '${date}','${current_time}')`;
    var data=await exe(sql);
    res.redirect("/contact-us");
});
// 
router.get("/login",async function(req,res){
    var navbar=await exe(`SELECT * FROM navbar_logo`);
    var footer_data=await exe(`SELECT * FROM footer_data`);

         
    var data=await exe(`SELECT * FROM category`);
    var obj={"cats":data,"is_login":is_login(req),"logo":navbar[0],"footer_data":footer_data[0]};
    res.render("user/login.ejs",obj);
});
router.get("/shopping-bag",function(req,res){
    res.render("user/shopping-bag.ejs");
});
router.get("/user_profile",  CheckLogin ,async function (req, res) {
        var navbar = await exe(`SELECT * FROM navbar_logo`);
        var footer_data = await exe(`SELECT * FROM footer_data`);
        var data = await exe(`SELECT * FROM category`);
        var user_det = await exe(`SELECT * FROM user_accounts WHERE user_id = ${req.session.user_id}`);
       var obj = {
            cats: data,
            user_det: user_det[0],
            is_login: is_login(req),
            logo: navbar[0],
            footer_data: footer_data[0]
        };
        res.render("user/user_profile.ejs", obj);
   
});
router.get("/edit_user_profile/:id",CheckLogin,async function(req,res){
    var navbar = await exe(`SELECT * FROM navbar_logo`);
    var footer_data = await exe(`SELECT * FROM footer_data`);
    var data = await exe(`SELECT * FROM category`);
    var user_det = await exe(`SELECT * FROM user_accounts WHERE user_id = ${req.session.user_id}`);
   var obj = {
        cats: data,
        user_det: user_det[0],
        is_login: is_login(req),
        logo: navbar[0],
        footer_data: footer_data[0]
    };
    res.render("user/edit_user_profile.ejs",obj);
});
router.post("/update_user_login",CheckLogin,async function(req,res){
    var d=req.body;
    var sql=`UPDATE user_accounts SET user_name = ? , mobile = ?, email =?, password = ? WHERE user_id ='${d.user_id}'`;
    var data=await exe(sql,[d.username,d.mobile,d.email,d.password]);
    res.redirect("/user_profile");
})

router.get('/logout_user', (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/'); // In case of error, redirect to home
        }
        // Redirect to the home page or login page after logging out
        res.redirect('/');
    });
});


module.exports=router;