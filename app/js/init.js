'use strict';
/*jshint -W083 */ //TODO remove in production

var helpers = require('./services/helpers.js');
var config = require('./services/config.js');
var df = config.startForm;
var icao = require('./services/icao.js');
var dbdata = {};
var $inputs = $('#controls').find("[id]");
console.log($inputs);

module.exports = {

  init: function() {

    initForm(triggerChange);

    function initForm(callback) {

      // load carrier control
      // carriers = carriers module

      $.each(icao.carriers, function(i, obj) {
        var name = obj.carrier + '   ' + obj.carriername;
        $('#carrier').append(new Option(name, obj.carrier, true, true));
      });
      //$('#carrier').val("DL");

      // $.each(icao.carriers, function(i,obj) { //TODO need to fix the select all problem.
      //   $('#carrier').append('<option value="'+obj.carrier+'" selected>'+obj.carrier+' '+obj.carriername+'</option>');
      // });

      // load airports select
      var airport = $('select[name=airport]');
      $.each(icao.airports, function(i, obj) {
        var name = obj.id + '   ' + obj.name;
        airport.append(new Option(name, obj.id));
      });
      airport.val(config.defAirport);

      // var airport = $('#airport');  //attempt at using bootstrap dropdown...
      // $.each(icao.airports, function(i, obj) {
      //   var name = obj.id + '   ' + obj.name;
      //   airport.append('<li value="obj.id">'+obj.name+'</li>');
      // });
      // $('.dropdown-menu a').on('click', function(){
      //   $('.dropdown-toggle').html($(this).html() + '<span class="caret"></span>');
      //   airport.val($(this).val());
      // });
      //   airport.val(config.defAirport);

      // load delay select
      var delays = config.delays;
      var delay = $('select[name=delay]');
      $.each(delays, function(i, obj) {
        var period = (obj[0] > 0 && obj[0] < 1.5) ? ' hour' : ' hours';
        delay.append(new Option(obj[1] + period, obj[0]));
      });
      delay.val(config.delay);

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
      //$('#carrier').val(df.carrier);
      $('#delay').val(df.delay);

      // inputs onChange handler

      var formChanged = function (e) {

        console.log('changed input: ', e.target.name);
        var data = getFormData($inputs);
        console.log('data from .change: ', data);
        if (["startDate", "numDays", "airport"].indexOf(e.target.name) > -1) {
          console.log('big 3');
          getFlightData(data, updateDisplayData);
        } else {
          console.log('change ok');
          updateDisplayData(data);
        }

      };

      $inputs.on('change', formChanged);

      //  $('select').selectr();

      callback(); // cb triggerChanged
    }

    function triggerChange() {
        $('#numDays').triggerHandler('change');
      }

    //get form data and then GET flight data based on those choices;
    //called from / returned to $inputs.onChange handler;
    function getFormData(controls) { //********** , callback
      var key, val;
      var formVals = {};
      controls.each(function() {
        key = $(this).prop("id");
        val = ($(this).prop("type") == "checkbox") ? $(this).is(':checked') : $(this).val();
        formVals[key] = val;
      });
          console.log('formvals from getFormData: ', formVals);

      return formVals;
    }

    // flight data ajax call to server api - uses server route to postgres function;

    function getFlightData(model, callback) { //called from init and $input.onChange
      console.log('model from getFlightData: ', model);

      var q = { // query string
        q: model.startDate,
        d: model.numDays,
        a: model.airport
      };
      var url = 'http://localhost:3000/flights/all';
      console.log('query string: ', q, url);

      $.ajax({
        url: url,
        data: q,
        dataType: "json",
        success: function(result) {
          console.log('result from ajax: ', result);
          dbdata = result; // store result for continued use;
          callback(model);
        },
        error: function(request, status, error) {
          console.log('ERROR:', request.body, status, request.status, request.responseText);
        }
      });
    }

    // update Display called from $input.onChange and getFlightData as cb; provides filter with modelChange() for displayed data (calls exposeData);

    function updateDisplayData(form) { //******** , callback
    console.log('form from updateDisplayData: ', form);
      var currData = dbdata.filter(modelChanged(form));
      console.log('filtered from updateDisplayData: ', currData);
      //callback(currData);
      exposeData(currData);
    }

    function modelChanged(form) { //filter fn for dbdata.filter
      console.log('form from modelChanged: ', form);
      return function(obj) {
        // console.log('obj from model Changed: ', obj);

        // return  (((obj.orig == (form.departure && form.airport)) ||
        //         (obj.dest == (form.arrival && form.airport))) &&
        //         (form.carrier.indexOf(obj.car) > -1));
        return (form.carrier.indexOf(obj.car) > -1);
      };
    }

    function exposeData(data) {

      console.log('data from exposeData: ', data);
      makeTable(data);
    }

    //create table using filtered data from updateDisplayData via exposeData

    function makeTable(celldata) {

      var tmap = config.tableMap;
      var content = '<tbody>';

      for (var i = 0; i < tmap.length; i++) {
        var colhead = tmap.filter(function(obj) {
          return obj.pos == i;
        });

          content += '<th>' + colhead[0].title + '</th>';
      }

      $.each(celldata, function(index, val) {
        content += '<tr>';

        for (var i = 0; i < tmap.length; i++) {
          var mapobj = tmap.filter(function(obj) {
            return obj.pos == i;
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

