$(document).ready(function() {

  // require('./lib/bootstrap-datepicker.js');
  // require('bootstrap-select');
  var icao = require('./services/icao.js');


// load carriersel control
// carriers = carriers module
  var carriersel = $('select[name=carrier]');
  $.each(icao.carriers, function(i, obj) {
    var name = (obj.id !== "99") ? obj.id + '   ' + obj.name : obj.name;
    carriersel.append(new Option(name, obj.id));
  });
  carriersel.val("99");

//load airports
  var airport = $('select[name=airport]');
  $.each(icao.airports, function(i, obj) {
    var name = obj.id + '   ' + obj.name;
    airport.append(new Option(name, obj.id));
  });
  airport.val("SEA");

// load delay control
  var delays = [
    [0, "0"],
    [0.5, "1/2"],
    [1, "1"],
    [1.5, "1-1/2"],
    [2, "2"],
    [2.5, "2-1/2"],
    [3, "3"]
  ];

  var delay = $('select[name=delay]');
  $.each(delays, function(i, obj) {
    var period = (obj[0] > 0 && obj[0] < 1.5) ? ' hour' : ' hours';
    delay.append(new Option(obj[1] + period, obj[0]));
  });
  delay.val("2");
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
  $('#airport').val("SEA");
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
  }, 50);

  console.log(formHeight);

  //TODO refactor form control defaults out of HTML;



  ////Debug
  var elems = $('#controls').find("[id]").each(function() {
    var thisval = ($(this).prop("type") == "checkbox") ? $(this).is(':checked') : $(this).val();
    console.log($(this).prop("id"), thisval);

  ////

  });




});


