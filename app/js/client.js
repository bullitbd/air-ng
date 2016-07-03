'use strict';

require('selectr');
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
    // console.log(formHeight);
  }, 20);
}



