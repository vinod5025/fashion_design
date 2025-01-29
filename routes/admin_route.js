var express=require("express");
const path = require('path');
var exe=require("./../connection");
var router=express.Router();


router.get('/logout_admin_pannel', (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/'); // In case of error, redirect to home
        }
        // Redirect to the home page or login page after logging out
        res.redirect('/admin');
    });
});
// check admin login
function checkLogin(req, res, next) {
    // req.session.admin_login_id=1;
    if (req.session.admin_login_id == undefined) {
      res.redirect("/admin/admin_login");
    } else {
      next();
    }
  }
  
  // admin_login_profile_inforamtion
router.get("/admin_login_profile_inforamtion" ,checkLogin ,async function(req,res){
    var data=await exe(`SELECT * FROM admin_login WHERE admin_login_id='${req.session.admin_login_id}'`);
    res.render('admin/admin_login_profile_inforamtion.ejs',{"admin_info":data[0]});
});

  router.post("/admin_login_process", async function (req, res) {
    var d = req.body;
    var sql = `SELECT * FROM admin_login WHERE admin_email='${d.admin_email}' AND admin_password='${d.admin_password}'`;
    var data = await exe(sql);
  
    if (data.length > 0) {
      var id = data[0].admin_login_id;
      req.session.admin_login_id = id; 
      res.redirect("/admin"); 
    } else {
      res.send(`
        <script>
          alert('Invalid User ID & Password. Please try again.');
          window.location.href = '/admin/admin_login'; // Adjust the redirect URL if needed
        </script>
      `);
    }
  });
  
  

router.get("/admin_login",function(req,res){
    res.render("admin/admin_login.ejs");
});

// category start
router.get("/add_category",checkLogin,async function(req,res){
    var data=await exe (`SELECT * FROM category`);

    res.render("admin/add_category.ejs",{"cats":data});
});
router.post("/save_category",checkLogin,async function(req,res){
    d=req.body;
    d.category_name=d.category_name.replaceAll("'","\\'");
    d.category_details=d.category_details.replaceAll("'","\\'");
    var data=await exe(`INSERT INTO category(category_name , category_details ) VALUES('${d.category_name}' , '${d.category_details}' )`);
    res.redirect("/admin/add_category");
});
router.get("/edit_category/:id",checkLogin,async function(req,res){
    var data=await exe(`SELECT * FROM category WHERE category_id='${req.params.id}'`);
    res.render("admin/edit_category.ejs",{"cats":data[0]});
});
router.post("/update_category/:id",checkLogin,async function(req,res){
    var d=req.body;
    var sql=`UPDATE category SET category_name='${d.category_name}', category_details='${d.category_details}' WHERE category_id ='${req.params.id}'`;
    var data=await exe(sql);
    res.redirect("/admin/add_category");
})
router.get("/delete_category/:id",checkLogin,async function(req,res){
    var data=await exe(`DELETE FROM category WHERE category_id ='${req.params.id}'`);
    res.redirect("/admin/add_category");
});
// category end

// add_product
router.get("/add_product",checkLogin,async function(req,res){
    var brands=await exe(`SELECT * FROM brands`);
    var cats=await exe(`SELECT * FROM category`);
    var prouct_list=await exe
    (   `SELECT * FROM products, category, brands WHERE products.product_category_id = category.category_id AND products.product_brand_id = brands.brand_id;
    `);
    var obj={"brands":brands,"cats":cats,"product_list":prouct_list};
    res.render("admin/add_product.ejs",obj);
});
router.post("/save_product",checkLogin, async function(req,res){
    var prouct_image1="";
    var prouct_image2="";
    var prouct_image3="";
    var prouct_image4="";
    if (req.files) {
        if (req.files.product_image1) {
            product_image1 = new Date().getTime() + ".png";
            req.files.product_image1.mv("public/uploads/" + product_image1);
        }
        if (req.files.product_image2) {
            product_image2 = new Date().getTime() + ".png";
            req.files.product_image2.mv("public/uploads/" + product_image2);
        }
        if (req.files.product_image3) {
            product_image3 = new Date().getTime() + ".png";
            req.files.product_image3.mv("public/uploads/" + product_image3);
        }
        if (req.files.product_image4) {
            product_image4 = new Date().getTime() + ".png";
            req.files.product_image4.mv("public/uploads/" + product_image4);
        }
    }
    var d=req.body;
    var sql=`INSERT INTO products(product_name, product_price, product_purchase_price, product_brand_id, product_category_id, product_type, product_details, product_size, product_color,product_image1,product_image2,product_image3,product_image4) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) `;
    var data=await exe(sql,[d.product_name, d.product_price, d.product_purchase_price, d.prouduct_brand_id, d.prouduct_category_id, d.prouct_type, d.product_details, d.product_size, d.product_color,product_image1 ,product_image2,product_image3,product_image4])
    res.redirect("/admin/add_product");
});
router.get("/delete_product/:id",checkLogin,async function(req,res){
    var sql=`DELETE FROM products WHERE product_id ='${req.params.id}'`;
    var data=await exe(sql);
    res.redirect("/admin/add_product");
});
// router.get("/edit_product/:id",checkLogin,async function(req,res){
//             var data=await exe(`SELECT *
//         FROM products, brands
//         WHERE products.product_id = brands.product_id
//         AND brands.brand_id = '${req.params.id}';
// `);
//     var obj={"product_info":data[0]}
//     console.log(data)
//     res.render("admin/edit_product.ejs",obj);
// });

router.post("/update_product",checkLogin, async function(req, res) {
    var product_image1 = req.body.product_image1 || "";
    var product_image2 = req.body.product_image2 || "";
    var product_image3 = req.body.product_image3 || "";
    var product_image4 = req.body.product_image4 || "";

    if (req.files) {
        // Handling image uploads, overwriting the old ones
        if (req.files.product_image1) {
            product_image1 = new Date().getTime() + ".png";
            req.files.product_image1.mv("public/uploads/" + product_image1);
        }
        if (req.files.product_image2) {
            product_image2 = new Date().getTime() + ".png";
            req.files.product_image2.mv("public/uploads/" + product_image2);
        }
        if (req.files.product_image3) {
            product_image3 = new Date().getTime() + ".png";
            req.files.product_image3.mv("public/uploads/" + product_image3);
        }
        if (req.files.product_image4) {
            product_image4 = new Date().getTime() + ".png";
            req.files.product_image4.mv("public/uploads/" + product_image4);
        }
    }

    var d = req.body;
    var sql = `UPDATE products SET 
                    product_name = ?, 
                    product_price = ?, 
                    product_purchase_price = ?, 
                    product_brand_id = ?, 
                    product_category_id = ?, 
                    product_type = ?, 
                    product_details = ?, 
                    product_size = ?, 
                    product_color = ?, 
                    product_image1 = ?, 
                    product_image2 = ?, 
                    product_image3 = ?, 
                    product_image4 = ? 
                WHERE product_id = '${req.params.id}'`;

    var data = await exe(sql, [
        d.product_name, 
        d.product_price, 
        d.product_purchase_price, 
        d.prouduct_brand_id, 
        d.prouduct_category_id, 
        d.prouct_type, 
        d.product_details, 
        d.product_size, 
        d.product_color, 
        product_image1,
        product_image2,
        product_image3,
        product_image4,
    ]);

    res.redirect("/admin/product_list");
});



// brand start
router.get("/add_brand", checkLogin,async function(req,res){
    var data=await exe(`SELECT * FROM brands`);
    res.render("admin/add_brand.ejs",{"brands":data});
});
router.get("/edit_brand/:id", checkLogin,async function(req,res){
    var data=await exe(`SELECT * FROM brands WHERE brand_id='${req.params.id}'`);
    res.render("admin/edit_brand.ejs",{"brands":data})
});
router.post("/add_brand", checkLogin,async function(req,res){
    var file_name="";
    d=req.body;
    d.brand_name=d.brand_name.replaceAll("'","\\'");
    d.brand_details=d.brand_details.replaceAll("'","\\'");
    if(req.files){
        var file_name=new Date().getTime()+".png";
        req.files.brand_image.mv("public/uploads/"+file_name);
    }
    var sql=`INSERT INTO brands(brand_name, brand_details, brand_image) VALUES ('${d.brand_name}', '${d.brand_details}', '${file_name}')`;
    var data=await exe(sql);
    res.redirect("/admin/add_brand");
});
router.post("/update_brand/:id",checkLogin,async function(req,res){
    var file_name="";
    d=req.body;
    d.brand_name=d.brand_name.replaceAll("'","\\'");
    d.brand_details=d.brand_details.replaceAll("'","\\'");
    if(req.files)
    {
        var file_name=new Date().getTime()+".png";
        req.files.brand_image.mv("public/uploads/"+file_name);
    var sql=`UPDATE brands SET brand_name='${d.brand_name}', brand_details ='${d.brand_details}', brand_image ='${file_name}' WHERE brand_id='${req.params.id}'`;
}
else{
    var sql=`UPDATE brands SET brand_name='${d.brand_name}', brand_details ='${d.brand_details}' WHERE brand_id='${req.params.id}'`;
    }
var data=await exe(sql);
    res.redirect("/admin/add_brand");  
});
router.get("/delete_brand/:id",checkLogin,async function(req,res){
    var data=await exe(`DELETE FROM brands WHERE brand_id='${req.params.id}'`);
    res.redirect("/admin/add_brand");
});
router.get("/", checkLogin, async function (req, res) {
    var data = await exe(`SELECT COUNT(*) as ttl FROM order_info WHERE order_status = 'pending'`);
    var pending_orders_paid_amt = await exe(`SELECT SUM(COALESCE(total, 0)) as ttl FROM order_info WHERE order_status = 'pending' AND payment_staus = 'paid'`);
    var pending_orders_UN_paid_amt = await exe(`SELECT SUM(COALESCE(total, 0)) as ttl FROM order_info WHERE order_status = 'pending' AND payment_staus = 'pending'`);

    var xaxis = [];
    var yaxis = [];
    var ctime = new Date().getTime();

    for (let i = 0; i < 7; i++) {
        var new_time = ctime - (86400 * 1000) * i;
        var new_date = new Date(new_time).toISOString().slice(0, 10);
        xaxis.push(new_date);

        var amount = await exe(`SELECT SUM(COALESCE(total, 0)) as ttl FROM order_info WHERE order_date = '${new_date}'`);
        yaxis.push(amount[0].ttl || 0);
    }

    var obj = {
        "pending_orders": data[0],
        "pending_orders_paid_amt": pending_orders_paid_amt[0],
        "pending_orders_UN_paid_amt": pending_orders_UN_paid_amt[0],
        "xaxis": xaxis,
        "yaxis": yaxis
    }

    res.render("admin/dashbord.ejs", obj);
});



router.get("/manage_navbar",async function(req,res){
    var data=await exe(`SELECT * FROM navbar_logo`);
    res.render("admin/manage_navbar.ejs",{"logo":data[0]});
});
router.post("/update_navbar",async function(req,res){
    if(req.files)
    {
        var new_image=new Date().getTime()+".png";
        req.files.navbar_logo.mv("public/uploads/"+new_image);
        var sql=await exe(`UPDATE navbar_logo  SET navbar_logo = '${new_image}'`);
        res.redirect("/admin/manage_navbar");
    }
    // res.redirect("/admin/manage_navbar");
    
});

// user_contact_info_to_admin
router.get("/user_contact_info_to_admin",checkLogin,async function(req,res){
    var data=await exe(`SELECT * FROM contact_user_info`)
    res.render("admin/user_contact_info_to_admin.ejs",{"user_info":data});
});
router.get("/delete_user_contact_info/:id",checkLogin,async function(req,res){
    var data =await exe(`DELETE FROM contact_user_info WHERE user_contact_info_id ='${req.params.id}'`);
    res.redirect("/admin/user_contact_info_to_admin");
});

router.get("/pending_orders",checkLogin,async function(req,res){
    var sql=`SELECT * FROM  order_info  WHERE order_status= 'pending'`;
    var data=await exe(sql);
    var obj={"pending_orders":data};
    res.render('admin/pending_orders.ejs',obj);
});
router.get("/dispatch_orders",checkLogin,async function(req,res){
    var sql=`SELECT * FROM  order_info  WHERE order_status= 'dispatch'`;
    var data=await exe(sql);
    var obj={"dispatch_orders":data};
    res.render('admin/dispatch_orders.ejs',obj);
});
router.get("/delivered_orders",checkLogin,async function(req,res){
    var sql=`SELECT * FROM  order_info  WHERE order_status= 'deliver'`;
    var data=await exe(sql);
    var obj={"deliver_orders":data};
    res.render('admin/deliver_orders.ejs',obj);
});

router.get("/reject_orders",checkLogin,async function(req,res){
    var sql=`SELECT * FROM  order_info  WHERE order_status= 'reject'`;
    var data=await exe(sql);
    var obj={"reject_orders":data};
    res.render('admin/reject_orders.ejs',obj);
});


router.get("/change_order_status_to_reject/:id",checkLogin,async function(req,res){
    var sql=`UPDATE order_info SET order_status ='reject'  WHERE order_id ='${req.params.id}'`;
    var data=await exe(sql);
    res.redirect("/admin/pending_orders");
});


router.get("/order_details/:id",checkLogin,async function(req,res){
    var id=req.params.id;
    var order_info=await exe(`SELECT * FROM order_info WHERE order_id='${id}'`);
    var products=await exe(`SELECT * FROM products,order_products WHERE products.product_id AND  order_id ='${id}'`);
    var obj={"order_info":order_info[0],"products":products};
    console.log(obj)
    res.render("admin/order_details.ejs",obj);
});


router.get("/change_order_status_to_dispatch/:id",checkLogin,async function(req,res){
    var sql=`UPDATE order_info SET order_status ='dispatch'  WHERE order_id ='${req.params.id}'`;
    var data=await exe(sql);
    res.redirect("/admin/pending_orders");
});
router.get("/change_order_status_to_deliver/:id",checkLogin,async function(req,res){
    var sql=`UPDATE order_info SET order_status ='deliver'  WHERE order_id ='${req.params.id}'`;
    var data=await exe(sql);
    res.redirect("/admin/pending_orders");
});

// change_order_status_to_deliver

router.get("/about_company",function(req,res){
    res.render("admin/about_company.ejs");
});
router.post("/update_footer_data", async function(req, res) {
    var d = req.body;
    var sql = `UPDATE footer_data SET about_site = ?, facebook_link = ?, linkedin_link = ?, instagram_link = ?, whatsapp_link = ? WHERE id = ?`;
    var data = await exe(sql, [d.about_site, d.facebook_link, d.linkedin_link, d.instagram_link, d.whatsapp_link, d.id]);
    res.redirect("/admin/about_company");
});






module.exports=router;