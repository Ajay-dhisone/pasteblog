
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const dbo = require("./db.js"); // Database connection
const blogmodel = require("./models/blogmodel.js"); // Blog model
const passport = require("passport"); // Authentication library
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Google OAuth strategy
const session = require('express-session'); // Session management
const user = require('./models/usermodel.js');
// const swal = require('sweetalert2');
const nodemailer = require('nodemailer');
// const notifier = require('node-notifier');
const mailjet = require('node-mailjet')
//setTimeout(() => console.log("This message will appear after 2 seconds."), 1000);
const flash = require('connect-flash');

require('dotenv').config();

var val = ""
// Database connection
dbo.getdb();



// View engine and static files
app.set('view engine', 'ejs');
app.set('views', "public");
app.use(express.static("public"));


// Body parser for form data
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(flash());
// Passport configuration
require('./passport.js')(passport); // Assumes config file exists

// Session management
app.use(session({
  secret: 'my_session_secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", async (req, res) => {

  let value = req.query.val

  const bloglist = await blogmodel.find({}).sort({ date: -1 }).exec();
  let result = req.isAuthenticated()
  val = ""


  if (req.isAuthenticated()) { // Check if user is logged in for creating new blogs

    const userdata = await user.findOne({googleId:req.user.googleId})
    const upic = userdata.picurl
    res.render("home.ejs",{result,bloglist,pageheading:"Recent Blogs",value,});
    //console.log(req.user.name);
  } else {
    res.render("home.ejs",{result,bloglist,pageheading:"Recent Blogs",value,});
  }
});

app.get("/newblog", (req, res) => {
  if (req.isAuthenticated()) { // Check if user is logged in for creating new blogs
    res.render("newblog.ejs",{result:true});
  } else {
    res.redirect("/account");
  }
});


//let userprofile = user.findById
app.get("/profile", async(req, res) => {
  // console.log(req.user.googleId);
  if (req.isAuthenticated()) {
    const articles= await blogmodel.find({authorid:req.user.googleId})
    // console.log(articles);
    const userdata = await user.findOne({googleId:req.user.googleId})
    const upic = userdata.picurl
    res.render("profile.ejs", { name: req.user.name.toUpperCase(), email:req.user.email,userdata,upic,articles,result:true,value:val}); // Pass user object to view
  } else {
    res.redirect("/account");
  }
});

app.get("/account", (req, res) => {

    res.render("account.ejs",{result:false,value:val}); // Pass user object to view

});

// Authentication routes
app.get('/auth/google', passport.authenticate('google'));

app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/?val=4', failureRedirect: '/account' }), (req, res) => {
  // Handle successful login and redirect to desired page
  console.log('User logged in successfully!');
});

// Protected route example


// app.get("/profile", async(req, res) => {
//   if (req.isAuthenticated()) {
//     // Show admin content for authenticated usersr
//     // console.log("admin access granted!");
//     userblogs = await blogmodel.find({authorid:"658b55f1a3dcd349566db5ce"})
//     res.render("/profile")
//   } else {
//     res.redirect("/account");
//   }
// });

// Post route for new blog
app.post("/newblog", (req, res) => {
  if (req.isAuthenticated()) {
    const blog = new blogmodel({ title: req.body.title, content: req.body.content, authorid: req.user.googleId }); // Add author ID from user object
    blog.save();
    val="1"
    res.redirect("/?val="+val);
  } else {
    res.redirect("/account");
  }
});


app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/?val=5');
  });
});

app.get('/blogs/:blogid', async (req, res) => {
  // console.log( req.params.blogid);
  const blogid = req.params.blogid; // Get title from parameter
  const ublog = await blogmodel.findOne({ _id:blogid });
  if (req.isAuthenticated()) {
    const blogger = await user.findOne({googleId:ublog.authorid})
    res.render("readblog",{title:ublog.title,content:ublog.content,result:true,blogger,value:val})
  } else {
   res.redirect("/account")
  }

   // Send all matching blogs as JSON
});

app.post("/searchblog",async (req,res)=>{
  const btitle = req.body.title
  // console.log(btitle);
  // await blogmodel.createindex( btitle , btitle )
  const sblogs = await blogmodel.find({ $text: { $search: btitle } } ).sort({ $score: { $meta: 'textScore' } })
  // console.log(sblogs.push(0));
  // console.log();
  if (sblogs.length==0) {
    res.redirect("/?val="+"3")
    
   
  } else {
    res.render("home",{result:true,value:val,bloglist:sblogs,pageheading:"searched for "+btitle})
  }
  
})

app.get("/delete/:blogid",async(req,res)=>{

  const blogid = req.params.blogid; // Get title from parameter
  const ublog = await blogmodel.deleteOne({ _id:blogid });
  res.redirect("/profile")

})

app.get('/profile/:bloggerid', async (req, res) => {
  // console.log( req.params.blogid);
  const bloggerid = req.params.bloggerid; // Get title from parameter
  // const ublog = await blogmodel.findOne({ _id:blogid });
// console.log(bloggerid);
  if (req.isAuthenticated()) {
    const articles= await blogmodel.find({authorid:bloggerid})
    // console.log(articles);
    const userdata = await user.findOne({googleId:bloggerid})
    const upic = userdata.picurl
    res.render("anotheruser",{name:userdata.name.toUpperCase(),email:userdata.email,result:true,upic,articles,value:val})
  } else {
   res.redirect("/account")
  }

   // Send all matching blogs as JSON
});



app.get("/contact-us",(req,res)=>{

  if (req.isAuthenticated()) {

  res.render("contact",{result:true,value:val})

    } else {
   res.redirect("/account")
  }

})

// const mailjet = require('node-mailjet');

// Securely store API keys in environment variables
// console.log(process.env.MAILJET_PUBLIC_KEY);
const Mailjet = mailjet.apiConnect(

  process.env.MAILJET_PUBLIC_KEY,
  process.env.MAILJET_PRIVATE_KEY,
);



app.post('/contact-us', async (req, res) => {

  const { name, message } = req.body;

  const request = Mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: req.user.email,
                Name: name
              },
              To: [
                {
                  Email: "ajdhisone07@gmail.com",
                  Name: "Ajay"
                }
              ],
              Subject: "check",
              TextPart: "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
              HTMLPart: '<p>'+ message +'</p>'
            }
          ]
        })
        val="2"
        res.redirect("/?val="+val)

    .then((result) => {
        // console.log(result.body)
        // console.log(result.body)
        console.log();
        
    })
    .catch((err) => {
        console.log(err.statusCode)
    })

});




// Start server
app.listen(3000, () => console.log("Server listening on port 3000"));
