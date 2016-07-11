'use strict';

var model = {};

module.exports = {



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
