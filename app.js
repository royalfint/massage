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
    productRoutes  = require("./routes/products"),
    indexRoutes    = require("./routes/index");

mongoose.connect("mongodb://bazarmanager:YtEpyftimVjq1Gfhjkm@ds125241.mlab.com:25241/bazarlardb");


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   //res.locals.url = "https://bazarlar--royalfint.c9users.io";
   res.locals.url = "https://www.bazarlar.kz";
   next();
});

app.use("/",indexRoutes);
app.use("/products/:id/comments",commentRoutes);
app.use("/products", productRoutes);

//LISTENING FOR USERS
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("The Bazarlar Server Has Started!");
});