var help = {};

help.daysToDate = function(input_date, daystoadd) {
    var date = new Date(input_date);
    var newdate = new Date(date);
    newdate.setDate(newdate.getDate() + daystoadd);
    return newdate;
};

help.tillDate = function(welldate){ 
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var secondDate = new Date(welldate);
    var firstDate = new Date();
    //return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
    return Math.round((firstDate.getTime() - secondDate.getTime())/(oneDay) * -1);
};

help.toLocalTime = function(time) {
  var d = new Date(time);
  var offset = (new Date().getTimezoneOffset() / 60) * -1;
  var n = new Date(d.getTime() + offset);
  return n;
};

help.getRandomInt = function (max) {
  return Math.floor(Math.random() * Math.floor(max));
};

help.deathTomorrow = function () {
    var date = help.daysToDate(new Date(), 1);
    
    return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

module.exports = help;