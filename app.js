var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    passport       = require("passport"),
    multer         = require('multer'),
    methodOverride = require("method-override"),
    LocalStrategy  = require("passport-local"),
    flash          = require("connect-flash"),
    User           = require("./models/user");
    
var commentRoutes  = require("./routes/comments"),
    adminRoutes    = require("./routes/admin"),
    productRoutes  = require("./routes/products"),
    authRoutes     = require("./routes/auth"),
    servicesRoutes = require("./routes/services"),
    appartsRoutes  = require("./routes/apparts"),
    dealsRoutes    = require("./routes/deals"),
    newRoutes      = require('./routes/girls'),
    indexRoutes    = require("./routes/index");


mongoose.connect('mongodb://admin:YtEpyftimVjq1Gfhjkm@ds149344.mlab.com:49344/massaj');
global.uploadUrl = "https://unique.plus/upload/upload.php";
global.cdn = "https://unique.plus/upload/";
global.lang = "ru";
//global.siteurl = "https://massaj-royalfint.c9users.io/";
global.siteurl = "http://massaj.herokuapp.com/";
User.findOne({username: 'admin'}, function(err, profile){
    if(err) console.log(err);
    
    global.title = profile.title;
    global.address = profile.address;
    global.phone = profile.phone;
    global.girlsTitle = profile.girlsTitle;
    global.serviceTitle = profile.serviceTitle;
    global.appartsTitle = profile.appartsTitle;
    global.aboutTitle = profile.aboutTitle;
    global.dealsTitle = profile.dealsTitle;
    global.contactsTitle = profile.contactsTitle;
});

app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   res.locals.url = global.siteurl;
   res.locals.cdn = global.cdn;
   res.locals.title = global.title;
   res.locals.address = global.address;
   res.locals.phone = global.phone;
   res.locals.lang = global.lang;
   res.locals.uploadUrl = global.uploadUrl;
   res.locals.status = req.session.status;
   next();
});

app.use("/",indexRoutes);
app.use("/", authRoutes);
app.use("/", adminRoutes);
app.use("/products", productRoutes);
app.use("/apparts", appartsRoutes);
app.use("/services", servicesRoutes);
app.use("/deals", dealsRoutes);
app.use("/", newRoutes);

//LISTENING FOR USERS
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("The Bazarlar Server Has Started!");
});