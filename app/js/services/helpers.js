'use strict';

var url = 'localhost:3000/flights/all';
var model = {};

module.exports = {

  getFlights: function getFlightData(q) { //q is data object
    //var query = '/?'+q.start+'&'+q.days+'&'+q.airport;
    $.get(url, q, function(data) {
      return data;
    });
  },

  getForm: function getFormData($form) {
    var key, val;
    model = {};
    $form.find("[id]").each(function() {
      key = $(this).prop("id");
      val = ($(this).prop("type") == "checkbox") ? $(this).is(':checked') : $(this).val();
      model[key] = val;
    });
    console.log(model);
  },

};

function resetForm(form) {
    form.find('input:text, input:password, input:file, select, textarea').val('');
    form.find('input:radio, input:checkbox').removeAttr('checked').removeAttr('selected');
}




//save this elsewhere
  // setForm: function populateForm($form, data) {
  //   resetForm($form);
  //   $.each(data, function(key, value) {
  //       var $ctrl = $form.find('[name='+key+']');
  //       if ($ctrl.is('select')){
  //           $('option', $ctrl).each(function() {
  //               if (this.value == value)
  //                   this.selected = true;
  //           });
  //       } else if ($ctrl.is('textarea')) {
  //           $ctrl.val(value);
  //       } else {
  //           switch($ctrl.attr('type')) {
  //               case "text":
  //                   $ctrl.val(value);
  //                   break;
  //               case "checkbox":
  //                   if (value == '1')
  //                       $ctrl.prop('checked', true);
  //                   else
  //                       $ctrl.prop('checked', false);
  //                   break;
  //           }
  //       }
  //   });
  // }
