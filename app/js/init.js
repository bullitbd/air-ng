var helpers = require('./services/helpers.js');
var config = require('./services/config.js');
var icao = require('./services/icao.js');
var model = require('./services/model.js');


$(document).ready(function() {

  var formHeight;
  setTimeout(function() {
    formHeight = $('form').height();
    $('#heat').height(formHeight);
    // console.log(formHeight);
  }, 20);

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

  $('#numDays').val(config.days);
  $('#airport').val(config.airport);
  $('#arrivals').prop('checked', false);
  $('#departures').prop('checked', true);
  $('#international').prop('checked', true);
  $('#domestic').prop('checked', true);
  $('#carrier').val("99");
  $('#delay').val(2);


    //get form data and then GET flight data based on those choices;
  getFormData($('#controls'), getFlightData);

  function getFormData($form, callback) {
    var key, val;
    model = {};
    $form.find("[id]").each(function() {
      key = $(this).prop("id");
      val = ($(this).prop("type") == "checkbox") ? $(this).is(':checked') : $(this).val();
      model[key] = val;
    });

    callback(model);
  }

  function getFlightData(model) { //q is data object
            console.log(model);

    var q = {q:model.startDate,d:model.numDays,a:model.airport};
    var url = 'http://localhost:3000/flights/all';
    console.log(q, url);

    $.ajax({
      url: url,
      data: q,
      dataType: "json",
      success: function(data) {
      $('#placeholder').val(data);
      console.log('data : ', data);
      },
      error: function (request, status, error) {
      console.log(request.body, status, request.status, request.responseText);
      }
    });
  }
});
