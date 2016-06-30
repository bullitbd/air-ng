var helpers = require('./services/helpers.js');
var config = require('./services/config.js');
var df = config.startForm;
var icao = require('./services/icao.js');
var model = require('./services/model.js');


module.exports = {

  init: function() {

    // load carriersel control
    // carriers = carriers module
    var carriersel = $('select[name=carrier]');
    $.each(icao.carriers, function(i, obj) {
      var name = obj.id + '   ' + obj.name;
      carriersel.append(new Option(name, obj.id));
    });
    carriersel.multiselect();

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

    $('#numDays').val(df.numDays);
    $('#airport').val(df.airport);
    $('#arrivals').prop('checked', df.arrivals);
    $('#departures').prop('checked', df.departures);
    $('#international').prop('checked', df.international);
    $('#domestic').prop('checked', df.domestic);
    $('#carrier').val(df.carrier);
    $('#delay').val(df.delay);


    //get form data and then GET flight data based on those choices;
    getFormData($('#controls'), getFlightData);

    $('#controls').change(function(e) {

    });

    function getFormData($form, callback) {
      var key, val;
      model = {};
      $form.find("[id]").each(function() {
        key = $(this).prop("id");
        val = ($(this).prop("type") == "checkbox") ? $(this).is(':checked') : $(this).val();
        model[key] = val;
      });

      callback(model, exposeData);
    }

    function getFlightData(model, callback) { //q is data object
      console.log('model: ', model);

      var q = {
        q: model.startDate,
        d: model.numDays,
        a: model.airport
      };
      var url = 'http://localhost:3000/flights/all';
      console.log(q, url);

      $.ajax({
        url: url,
        data: q,
        dataType: "json",
        success: function(result) {
          callback(result);
        },
        error: function(request, status, error) {
          console.log(request.body, status, request.status, request.responseText);
        }
      });
    }
    // var flightdata;

    function exposeData(data) {


      // $.each(data, function(key, val) {
      //   $('#placeholder').append(val.acity);

      // });
      //flightdata = data;
      console.log('flightdata inside : ', data[0]);
      makeTable(data);

    }

    function makeTable(celldata) {
// console.log(celldata);
      var tmap = config.tableMap;
              console.log('tmap: ',tmap);
      var content = '<tbody>';

      for (var i = 0; i < tmap.length; i++) {
        var colhead = tmap.filter(function(obj) {
          return obj.pos == i;
        });

          content += '<th>' + colhead[0].title + '</th>';
      }
// console.log(content);
      $.each(celldata, function(index, val) {
              // console.log('celldata.row: ', val);

        content += '<tr>';

        for (var i = 0; i < tmap.length; i++) {

          var mapobj = tmap.filter(function(obj) {
            return obj.pos == i;
              // console.log('mapobj: ', mapobj);

          });
          content += '<td>' + val[mapobj[0].data] + '</td>';
        }

        content += '</tr>';
      });

      content += '</tbody>';
      $('#flightTable').html(content);
    }

  }



};
