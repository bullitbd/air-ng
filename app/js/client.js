'use strict';


require('bootstrap-select');
require('./lib/bootstrap-datepicker.js');

var init = require('./init.js').init;
var flightdata = require('./init.js').flightdata;
// require('./controllers/mainCtrl.js');

$(function() {
  init();
  panel();

});

function panel() {
  var formHeight;
  setTimeout(function() {
    formHeight = $('form').height();
    $('#heat').height(formHeight);
    // console.log(formHeight);
  }, 20);
}



