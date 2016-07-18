'use strict';

//require('selectr');
require('bootstrap-select');
var $ = require('jquery');
window.jQuery = $;
window.$ = $;

var datepicker = require('./lib/bootstrap-datepicker.js');
var init = require('./init.js').init;

$(function() {
  init();
  panel();

});

function panel() {
  var formHeight;
  setTimeout(function() {
    formHeight = $('form').height();
    $('#heat').height(formHeight);
  }, 20);
}



