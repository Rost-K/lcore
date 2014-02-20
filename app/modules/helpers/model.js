var Model = function (configObj) {
    /* configObj options
     data - model data preseted
     valid - function to validte data. Function recieves parameter callback and calls it with either true or array
      of objects with fields - field -name- and -message-
     save - method to send model to server. Recieves callback parameter
     fetch - method to get model to server. Recieves callback parameter. should populate data field

     methods:
      plant - fills form with data. gets either form selector or jQuery object as parameter
      harvest - gets data from form. gets either form selector or jQuery object as parameter
      displayErrors - recieves form - either form selector or jQuery object as parameter - and errors parameter -
        same object as validator passes
      clearErrors - removes errors
    */
    var config = configObj || {};
    var model = this;
    this.data = config.data || {};
    this.save = config.save || function (callback) {callback()};
    this.fetch = config.fetch || function (callback) {callback()};
    this.valid = config.valid || function (callback) {callback(true)};
    this.validators = {
        isSet: function (value) {
            if (typeof (value) == 'undefined') return false;
            if (!value) return false;
            return true;
        }
    }
    this.seed = function (form) {
        var model = this;
        if (form instanceof jQuery) {
            var $form = form;
        } else {
            var $form = $(form);
        }
        $form.find('[name]').each(function(){
            var $el = $(this);
            if ( model.data[$el.attr('name')]) {
                $el.data('field-type') == 'richtext' ? $el.html(model.data[$el.attr('name')]) : $el.val(model.data[$el.attr('name')]);
            }
        });
    }
    this.harvest = function (form) {
        var model = this;
        if (form instanceof jQuery) {
            var $form = form;
        } else {
            var $form = $(form);
        }
        $form.find('[name]').each(function(){
            var $el = $(this);
            if ($el.attr('name')) {
                model.data[$el.attr('name')] = $el.data('field-type') == 'richtext' ? $el.html() : $el.val();
            }
        });
    }
    this.clearErrors = function (form) {
        if (form instanceof jQuery) {
            var $form = form;
        } else {
            var $form = $(form);
        }

        $form.find('.help-block.has-error').remove();
        $form.find('div.form-group.has-error').removeClass('has-error');
    }
    this.clearForm = function (form) {
        if (form instanceof jQuery) {
            var $form = form;
        } else {
            var $form = $(form);
        }
        $form.find('[name]').each(function(){
            $el = $(this);
            $el.data('field-type') == 'richtext' ? $el.html('') : $el.val('');
        });
        this.clearErrors($form);
    }
    this.displayErrors = function (form, errors) {
        if (errors === true) return;
        if (form instanceof jQuery) {
            var $form = form;
        } else {
            var $form = $(form);
        }
        for (var i=0; i < errors.length; i++) {
            var fieldName = errors[i].field;
            var msg = errors[i].message;
            $form.find('[name="' + fieldName + '"]').each(function(){
                var $el = $(this);
                var $errorLabel = $('<div></div>', {
                    class: 'help-block has-error'
                }).html(msg);
                $el.parents('div.form-group').addClass('has-error');
                $el.after($errorLabel);
            })
        }
    }
}

module.exports = Model;
