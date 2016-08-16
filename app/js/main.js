// TODO add classes where css refers to ids
// TODO add loading page
// TODO api speed
// TODO normalize time zone to #airport
// TODO bring loads into webpack

'use strict';
/*jshint -W083 */

var Highcharts = require('highcharts');
var helpers = require('./services/helpers.js');
var config = require('./services/config.js');

var icao = require('./services/icao.js');
var dbdata = {};
var $inputs = $('#controls').find("[id]");
var moment = require('moment');
var period = config.chart.period;
var startDay = config.chart.startDay;
require('./lib/bootstrap-datepicker.js');
var controls = $('#controls [id]');
console.log(controls);

// TODO how link to highcharts themes?
//require('highcharts/themes/air.js')(Highcharts);

var t0, t1; //debug

module.exports = function() {

  //main: function() {

  // Array.prototype.rotate = function(n) {
  //   return this.slice(n, this.length).concat(this.slice(0, n));
  // };

  initForm(triggerChange);

  //***********************************************************************

  function initForm(callback) {

    // load carrier control

    // carriers = carriers module
    $.each(icao.carriers, function(i, obj) {
      var name = obj.carrier + '   ' + obj.carriername;
      $('#carrier').append(new Option(name, obj.carrier, true, true));
    });

    // load airports select
    var airport = $('#airport');
    $.each(icao.airports, function(i, obj) {
      var name = obj.id + '   ' + obj.name;
      airport.append(new Option(name, obj.id));
    });
    airport.val(config.defAirport);

    // load delay select // TODO build this
    var delays = config.delays;
    var delay = $('#delay');
    $.each(delays, function(i, obj) {
      var period = (obj[0] > 0 && obj[0] < 1.5) ? ' hour' : ' hours';
      delay.append(new Option(obj[1] + period, obj[0]));
    });
    delay.val(config.delay);

    //initialize form controls:

    //setup datepicker
    $('#startDate').datepicker({
      setDate: new Date(),
      format: 'yyyy-mm-dd',
      orientation: "top right",
      container: '.container',
      todayHighlight: true,
      autoclose: true
    }).datepicker("update", new Date());
    // $('#startDate').datepicker('setfltue', new Date()); // use with original version

    //init other controls
    var df = config.startForm;
    $('#numDays').val(df.numDays);
    $('#airport').val(df.airport);
    $('#arrivals').prop('checked', df.arrivals);
    $('#departures').prop('checked', df.departures);
    $('#international').prop('checked', df.international);
    $('#domestic').prop('checked', df.domestic);
    //$('#carrier').val set in load carriers control;
    $('#delay').val(df.delay);

    // inputs onChange handler

    function formChanged(e) {
      var formflts = getFormData($inputs);
      if (["startDate", "numDays", "airport"].indexOf(e.target.name) > -1) {
        getFlightData(formflts, updateDisplayData);
      } else {
        updateDisplayData(formflts);
      }
    }

    $inputs.on('change', formChanged);

    $('#carrier').selectpicker({
      selectedTextFormat: 'count > 1',
      header: 'close',
      liveSearch: true,
      noneSelectedText: 'none',
      actionsBox: true
    });
    console.log('end init'); //debug
    //$('.carrier').selectpicker('refresh');

    // TODO //  $('select').selectr();
    callback(); // cb triggerChanged

  } // END initForm

  //***********************************************************************

  function triggerChange() { // setup initial state called from initForm()
    $('#numDays').triggerHandler('change'); // fire $inputs.on('change', formChanged);
  }

  //get form data and then GET flight data based on those choices;
  //called from / returned to $inputs.onChange handler;

  function getFormData(controls) { // called from function formChanged(e) =>getFormData($inputs)
    var key, flt;
    var formflts = {};
    controls.each(function() {
      key = $(this).prop("id");
      flt = ($(this).prop("type") == "checkbox") ? $(this).is(':checked') : $(this).val();
      formflts[key] = flt;
    });
    console.log('form queried'); //debug
    return formflts;
  }

  //***********************************************************************

  // flight data ajax call to server api - uses server route to postgres function;
  function getFlightData(model, callback) { //called from init and $input.onChange
    var t0 = performance.now(); //debug

    var q = { // query string
      q: model.startDate,
      d: model.numDays,
      a: model.airport
    };
    //var url = (config.server || 'http://localhost:3000') + '/flights/all';
    var url = (config.server || 'http://localhost:3000') + '/flights/all';
    // console.log('url: ', url);
    $.ajax({
      url: url,
      data: q,
      dataType: "json",

      success: function(result) {

        dbdata = result; // store result for continued use;
        console.log('data success'); //debug
        var t1 = performance.now(); //debug
        console.log('getFlightData took ' + (t1 - t0) + 'ms');
        callback(model); // cb updateDisplayData

      },

      error: function(request, status, error) {
        // console.log('ERROR:', request.body, status, request.status, request.responseText);
      }
    });

  } // END getFlightData(model, callback -> updateDisplayData)

  //***********************************************************************

  // update Display called from $input.onChange and getFlightData as cb; provides filter with modelChange() for displayed data (calls exposeData);

  function updateDisplayData(form) {
    // console.log('form from updateDisplayData: ', form);
    var currData = dbdata.filter(modelChanged(form));
    // console.log('filtered from updateDisplayData: ', currData.length);
    console.log('display updated'); //debug
    exposeData(currData, form);
  } // END updateDisplayData(form)

  //***********************************************************************

  function modelChanged(form) { //filter fn for dbdata.filter
    // console.log('form from modelChanged: ', form);
    var criteria;
    return function(obj) { // obj is 'each' of dbdata.filter
      //choose arriflts/departures/both
      if (form.departures) { // if departures checked
        if (form.arrivals) { // and arriflts checked
          criteria = true;
        } else {
          criteria = (obj.orig == form.airport);
        }
      } else if (form.arrivals) {
        criteria = (obj.dest == form.airport);
      }
      //return carrier in selected AND arriflts/departures + avoid indexOf(null)
      return form.carrier !== null ? ((form.carrier.indexOf(obj.car) > -1) && criteria) : false;

    };
  } // END modelChanged

  //***********************************************************************

  function exposeData(data, form) { //currData from updateDisplayData <= dbdata.filter(modelChanged(form))

    function panelInfo(data, form, callback) { // info in panel header
      var counta = 0,
        countd = 0;
      $.each(data, function(i, obj) {
        if (obj.orig == form.airport) {
          countd += 1;
        } else if (obj.dest == form.airport) {
          counta += 1;
        }
      });
      var start = moment(form.startDate);
      var end = moment(start).add(form.numDays - 1, 'days');

      var arrdep = function(form) { // counts arriflts & departures separately
        if (form.arrivals) {
          if (form.departures) {
            return counta + ' Flights <span style="color:#008000"><em>Arriving at</em></span> & ' + countd + ' Flights <span style="color:#0000CD"><em>Departing from</em></span> ';
          } else {
            return counta + ' Flights <span style="color:#008000"><em>Arriving at</em></span> ';
          }
        } else if (form.departures) {
          return countd + ' Flights <span style="color:#0000CD"><em>Departing from</em><span> ';
        }
      };
      var daterange = (!end.isAfter(start)) ? start.format('LL') : start.format('LL') + ' to ' + end.format('LL');
      var str = (data.length > 0) ? '<strong>' + daterange + '</strong>' + ' &nbsp&nbsp&nbsp' + arrdep(form) + form.airport : '';

      $('#panelInfo span').html(str);
      callback('panel');
    } // END panelInfo

    // ****************** CHART FUNCTIONS ***********************



    function makeSlots(data, controls, cb) { // important! these need to remain sorted! make 2 sets of slots for arriflts and departures populate
      // var period = config.period, moved to globals // minutes TODO add input control
      var t0 = performance.now(); //debug
      var interflts = controls.numDays * 86400 / period / 60, //total # of slots
        slots = { arrSlots: [], depSlots: [] },
        start = moment(controls.startDate);
      // console.log('interflts: ', interflts);
      for (var i = 0; i < interflts; i++) {
        var date = moment(start).add((i + 1) * period, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        for (var prop in slots) {
          slots[prop].push({ date: date.split(' '), pax: 0, flights: [] });
        }
      }
      // console.log('slots array: ', slots);
      var t1 = performance.now(); //debug

      cb(data, slots, controls, drawChart); // cb = makeChartData
      console.log('makeSlots took ' + (t1 - t0) + 'ms');

    } // END makeSlots


    function getSlot(slots, obj) { // if obj date <= slot date return row push
      // console.log('getSlot obj? ',obj);
      for (var i = 0; i < slots.arrSlots.length; i++) {
        if (obj.isodate <= slots.arrSlots[i].date.join(' ')) {
          return i;
        }
      }
    }

    function makeChartData(data, slots, form, cb) { // cb = drawChart
      var t0 = performance.now(); //debug
      data.forEach(function(row) {
        var j = getSlot(slots, row);
        // split into separate series
        if (row.dest == form.airport) {
          slots.arrSlots[j].flights.push(row);
          slots.arrSlots[j].pax += row.seats;
        } else {
          slots.depSlots[j].flights.push(row);
          slots.depSlots[j].pax += row.seats;
        }

      });
      var t1 = performance.now(); //debug
      console.log('makeChartData took ' + (t1 - t0) + 'ms');
      cb(slots, form, returnChartData); // drawChart()
      t1 = performance.now();
      console.log('makeChartData with draw took ' + (t1 - t0) + 'ms');

    } // END makeChartData

    function returnChartData(slots, points) { // return visible data points in chart
      var t0 = performance.now(); //debug

      var flights = [];
      points.forEach(function(point, i) {
        flights.push(slots.arrSlots[point].flights);
        flights.push(slots.depSlots[point].flights);
      });
      flights = flights.reduce(function(a, b) {
        return a.concat(b);
      }, []).sort(function(a, b) {
        return a.ts - b.ts;
      });
      // console.log('chart data: ', points);
      console.log('flights? ', flights.length);
      //makeTable(flights, form);
      //panelInfo(flights, form);
      $('#slotTime').val(period); // TODO make these persistent
      $('#dayStart').val(startDay);
      var t1 = performance.now(); //debug
      console.log('returnChartData took ' + (t1 - t0) + 'ms');
    } // END returnChartData


    // capture slot period change:
    $('#slotTime').bind('keypress, change', function(e) {
      if (e.type === 'change' || e.keycode == 13) {
        period = $(this).val();
        $(this).blur();
        makeSlots(data, form, makeChartData);
      }
      // TODO set period cookie
    });

    $('#dayStart').bind('keypress, change', function(e) {
      if (e.type === 'change' || e.keycode == 13) {
        startDay = $(this).val();
        $(this).blur();
        makeSlots(data, form, makeChartData); //
      }
      // TODO set period cookie, combine functions;
    });

    //*********************************************************************
    function tell(param) {
      console.log(param);
    }
    makeSlots(data, form, makeChartData);
    panelInfo(data, form, tell);
    makeTable(data, form, tell);
    console.log('data exposed'); //debug
  } // fn exposeData

  var drawChart = require('./controllers/chart.js');

  //***********************************************************************

  //create table using filtered data from updateDisplayData via exposeData

  function makeTable(flights, formflts, cb) { //build table to display charted records
    if (flights.length === 0) return;
    var tmap = config.table.map;
    var starter = config.table.init.rows; // number of rows for first pass
    var content = '<tbody>';
    var titles = '<tbody><tr>';
    var flight = {};

    for (var i = 0; i < tmap.length; i++) { // get <th> rows
      var colhead = tmap.filter(function(obj) {
        return obj.pos == i;
      });

      titles += '<td><div>' + colhead[0].title + '</div></td>';
    }
    titles += '</tr></tbody>';

    console.log('flights ', flights.length);

    // for (var n = 0; n < starter; n++) {
    //   flight = flights[n];
    $.each(flights, function(index, flt) {
      content += '<tr';
      if (flight.dest == formflts.airport) {
        content += ' class="arr-color">';
      } else {
        content += ' class="dep-color">';
      }

      for (i = 0; i < tmap.length; i++) {
        var mapobj = tmap.filter(function(obj) {
          return obj.pos == i;
        });
        content += '<td>' + flt[mapobj[0].data] + '</td>';
      }
      content += '</tr>';
      // }
      });

      content += '</tbody>';

      // if (flights.length > 0) {
        $('#tablehead').html(titles);
      // } else {
        // $('#tablehead').html('');
      // }
      $('#flightTable').html(content);

      cb('table');

      // ***align th labels with column widths:***
      var tablearr = $('#flightTable tr:first-child td').map(function() {
        return $(this).width();
      });

      $('#tablehead td>div').each(function(i) {
        $(this).css('width', tablearr[i]);
      });

      //****************************

    }


    // function drawChart(slots, formflts) { // cb from makeChartData

    //   // TODO add drilldown to flight info;
    //   // build chart data series:
    //   var s = {};
    //   for(var i = 0, keys = Object.keys(slots); i < keys.length; i++) {
    //     s[keys[i] + 'Data'] = slots[keys[i]].map(function(obj) {
    //       return [Date.parse(obj.date.join('T')), obj.pax];
    //     });
    //   }
    //   var options = require('./services/hc_options.js')(formflts, s);

    //   $('#main-chart').highcharts(options, function() {
    //     $('#slotTime').val(period); // TODO make these persistent
    //     $('#dayStart').val(startDay);
    //   });
    // }

  };
