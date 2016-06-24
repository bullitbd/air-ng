var helpers = require('./services/helpers.js');
var config = require('./services/config.js');
var icao = require('./services/icao.js');
var model = require('./services/model.js');


$(document).ready(function() {

// load carriersel control
// carriers = carriers module
  var carriersel = $('select[name=carrier]');
  $.each(icao.carriers, function(i, obj) {
    var name = (obj.id !== "99") ? obj.id + '   ' + obj.name : obj.name;
    carriersel.append(new Option(name, obj.id));
  });
  carriersel.val("99");

//load airports select
  var airport = $('select[name=airport]');
  $.each(icao.airports, function(i, obj) {
    var name = obj.id + '   ' + obj.name;
    airport.append(new Option(name, obj.id));
  });
  airport.val(config.defAirport);

// load delay select
  var delays = config.delays;

  var delay = $('select[name=delay]');
  $.each(delays, function(i, obj) {
    var period = (obj[0] > 0 && obj[0] < 1.5) ? ' hour' : ' hours';
    delay.append(new Option(obj[1] + period, obj[0]));
  });
  delay.val(config.delay);
  //use selectpicker on these controls;
  // $('.selectpicker').selectpicker('refresh');

  //initialize form controls:

  //setup datepicker
  var date_input = $('input[name="startDate"]');
  var today = new Date();
  var options = {
    setDate: today,
    format: 'yyyy-mm-dd',
    container: 'container',
    todayHighlight: true,
    autoclose: true,
  };
  date_input.datepicker(options).datepicker("update", today);

  //init other controls


  $('#numDays').val(7);
  $('#airport').val(config.airport);
  $('#arrivals').prop('checked', false);
  $('#departures').prop('checked', true);
  $('#international').prop('checked', true);
  $('#domestic').prop('checked', true);
  $('#carrier').val("99");
  $('#delay').val(2);


  //temporarily? adjust #heat height to that of #form
  var formHeight;
  setTimeout(function() {
    formHeight = $('form').height();
    $('#heat').height(formHeight);
    // console.log(formHeight);
  }, 1);

  //helpers.getForm($('#controls'));




  ////Debug
  // var elems = $('#controls').find("[id]").each(function() {
  //   var thisval = ($(this).prop("type") == "checkbox") ? $(this).is(':checked') : $(this).val();
  //   console.log($(this).prop("id"), thisval);

  ////

  });
