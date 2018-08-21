var express     = require("express"),
    router      = express.Router(),
    User        = require("../models/user"),
    Payment     = require("../models/payment"),
    help        = require("../routes/help"),
    middleware  = require("../middleware/index.js");
    
var soap = require('soap');

router.get("/admin", middleware.isLoggedIn, function(req, res) {
    var adminperpage = 20;
    if(!req.session.adminpage) req.session.adminpage = 0;
    
   User.find({}).limit(adminperpage).skip(req.session.adminpage * adminperpage).exec(function(err, users) {
        if(err) console.log(err);
        
        res.render("admin", {users: users});
    });
});

router.get("/admin/edit/:username", middleware.isLoggedIn, function(req, res) {
    User.findOne({username: req.params.username}, function(err, user){
        if(err) console.log(err);
        
        if(!user) return console.log("Wrong username!!");
        
        var q = "free";
        if (user.ispaid) q = "paid";
        
        res.render("adminedit", {user: user, q: q});
    });
});

router.post("/admin/edit/:username", middleware.isLoggedIn, function(req, res) {
    User.findOne({username: req.params.username}, function(err, user){
        if(err) console.log(err);
        
        if(!user) return console.log("Wrong username!!");
        
        if(!req.body.ispaid) return console.log("Wrong option!!");
        
        if(req.body.ispaid == "paid")
            user.ispaid = true;
        else
            user.ispaid = false;
            
        user.save(function(err) {
            if(err) console.log(err);
            
            req.flash("success", "Аккаунт обновлен!");
            res.redirect("/admin");
        });
    });
});

router.get("/account", middleware.isLoggedIn, function(req, res) {
    User.findOne({username: req.user.username}, function(err, user) {
        if(err) console.log(err);
        
        var paidfordays = help.tillDate(user.paydate);
        
        res.render("panel/account", {user: user, paidfordays: paidfordays});
    });
});

router.post("/account", middleware.isLoggedIn, function(req, res) {
    
    if(!req.body.amount || req.body.amount == 0) {
        req.flash("error", "Введите сумму!");
        return res.redirect("back");
    }
    
    var options = { envelopeKey:'soapenv', xmlKey: 'sdm'};
    
    soap.createClient(global.payurl, options, function(err, client) {
        if(err) console.log(err);
        
        client.core_login({
            "coreLoginRequest": {
                "username": { attributes: { 'xsi:type': 'xsd:string' }, $value: "test_merch" },
                "password": { attributes: { 'xsi:type': 'xsd:string' }, $value: "A12345678a" },
            }
        }, function(err, result) {
            if(err) console.log(err);
            
            var sessioncookie;
            
            if (result.return.error_code['$value'] == 0) 
                sessioncookie = result.return.response.session['$value'];
            
            client.wsdl.definitions.xmlns.ns1 = "urn:XmlControllerwsdl";
            client.wsdl.definitions.xmlns.tns = "";
            client.wsdl.xmlnsInEnvelope = client.wsdl._xmlnsMap();
            client.addHttpHeader('Cookie', `session=` + sessioncookie);
            var payid = help.getRandomInt(56742);
                
            client.cash_createInvoice({
                cashCreateInvoiceRequest: {
                    "referenceId": { attributes: { 'xsi:type': 'xsd:string' }, $value: payid },
                    "backUrl": { attributes: { 'xsi:type': 'xsd:string' }, $value: global.siteurl + "/account" },
                    "requestUrl": { attributes: { 'xsi:type': 'xsd:string' }, $value: global.siteurl + "/paying" },
                    "addInfo": { attributes: { 'xsi:type': 'xsd:string' }, $value: "Пополнение баланса на Bazarlar" },
                    "amount": { attributes: { 'xsi:type': 'xsd:float' }, $value: Number(req.body.amount) },
                    "deathDate": { attributes: { 'xsi:type': 'xsd:string' }, $value: help.deathTomorrow() },
                    "serviceType": null,
                    "description": { attributes: { 'xsi:type': 'xsd:string' }, $value: "Пополнение баланса на Bazarlar" },
                    "orderNumber": null
                }
            }, function(err, result) {
                if(err) return res.send(err);
                
                var payurl = result.return.response.operationUrl['$value'];
                var paymid = result.return.response.operationId['$value'];
                
                Payment.create({payid: paymid, session: sessioncookie, username: req.user.username}, function(err, user) {
                    if(err) console.log(err);
                    
                    if(user && payurl) res.redirect(payurl);
                });
            });
        });
    });
});

router.get("/paying", function(req, res) {
    Payment.findOne().sort({created_at: -1}).exec(function(err, payment) {
        if(err) console.log(err);
        
        if(!payment) {
            console.log("no payments");
            return;
        }
        
        var options = { envelopeKey:'soapenv', xmlKey: 'sdm'};
        soap.createClient(global.payurl, options, function(err, client) {
            if(err) console.log(err);
            
            client.wsdl.definitions.xmlns.ns1 = "urn:XmlControllerwsdl";
            client.wsdl.definitions.xmlns.tns = "";
            client.wsdl.xmlnsInEnvelope = client.wsdl._xmlnsMap();
            client.addHttpHeader('Cookie', `session=` + payment.session);
                    
            client.cash_getOperationData({
                cashGetOperationDataRequest: {
                    operationId: {
                        item: payment.payid
                    }
                }
            }, function(err, result) {
                if(err) return res.send(err);
                
                var errcode = result.return.error_code['$value'];
                
                if(errcode == 5) {
                    Payment.remove({ _id: payment.id }, function(err) {
                        if(err) console.log(err);
                        return res.send("{\"data\":1}");
                    });
                } else if (errcode == 0) {
                    var resp = result.return.response.records.item.status['$value'];
                    
                    if(resp == 4) {
                        User.findOne({username: payment.username}, function(err, user) {
                            if(err) console.log(err);
                            
                            if(!user) {
                                console.log("no associated user to the payment!!!");
                                return res.send("{}");
                            }
                            
                            user.balance += Number(result.return.response.records.item.sum['$value']);
                            user.save(function(err){
                                if(err) console.log(err);
                                
                                Payment.remove({ _id: payment.id }, function(err) {
                                   if(err) console.log(err);
                                   
                                   return res.send("{\"data\":1}");
                                });
                            });
                        });
                    } else if (resp == 1){
                        Payment.remove({ _id: payment.id }, function(err) {
                            if(err) console.log(err);
                            return res.send("{\"data\":1}");
                        });
                    } else {
                        console.log(result.return.response.records.item);
                        return res.send("{}");
                    }
                } else {
                    console.log(result);
                }
            });
        });
    });
});


module.exports = router;