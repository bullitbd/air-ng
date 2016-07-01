'use strict';
/*jshint -W083 */ //TODO remove in production

var helpers = require('./services/helpers.js');
var config = require('./services/config.js');
var df = config.startForm;
var icao = require('./services/icao.js');
var dbdata = {};
var $inputs = $('#controls').find("[id]");



module.exports = {

  init: function() {

    initForm(getFormData);


    function initForm(callback) {

      // load carriersel control
      // carriers = carriers module
      var carriersel = $('select[name=carrier]');
      $.each(icao.carriers, function(i, obj) {
        var name = obj.id + '   ' + obj.name;
        carriersel.append(new Option(name, obj.id));
      });
      carriersel.multiselect({
        includeSelectAllOption: true,
        allSelectedText: 'All ...',
        selectAllJustVisible: false,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        maxHeight: 300,
        dropRight: true
          // buttonWidth:100%
      });

      carriersel.multiselect('selectAll', false);
      carriersel.multiselect('updateButtonText');

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

      $inputs.change(function(e) {
        console.log('changed input: ', e.target.name);
        if (["startDate", "numDays", "airport"].indexOf(e.target.name) > -1) {
          getFormData($inputs, getFlightData);
          console.log('big 3');
        } else {
          getFormData($inputs, updateDisplayData);
          console.log('change ok');
        }
      });
      console.log('inputs: ', $inputs);

      callback($inputs, getFlightData);
    }

    //get form data and then GET flight data based on those choices;
    // getFormData($inputs, getFlightData);

    // form change handler


    function getFormData(controls, callback) {
      var key, val;
      var formVals = {};
      controls.each(function() {
        key = $(this).prop("id");
        val = ($(this).prop("type") == "checkbox") ? $(this).is(':checked') : $(this).val();
        formVals[key] = val;
      });
          console.log('formvals: ', formVals);

      callback(formVals, exposeData);
    }

    function modelChanged(form) {
      return function(obj) {

        // return  (((obj.orig == (form.departure && form.airport)) ||
        //         (obj.dest == (form.arrival && form.airport))) &&
        //         (form.carrier.indexOf(obj.car) > -1));
        return ((obj.seats > 300) && (form.carrier.indexOf(obj.car) > -1));
      };
    }

    function updateDisplayData(form, callback) {
      var currData = dbdata.filter(modelChanged(form));
      callback(currData);
      console.log('currData: ', currData);
    }


    function getFlightData(model, callback) { //q is data object
      console.log('FDmodel: ', model);

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
          dbdata = result;
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
      console.log('flightdata inside : ', data);
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


//

