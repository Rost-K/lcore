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
    this.helpers = {};
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
                switch($el.data('field-type'))
                {
                    case 'richtext':
                        $el.html(model.data[$el.attr('name')]);
                        break;
                    case 'alias':
                        var alF = $el.data('alias-field');
                        var vlF = $el.data('value-field');
                        var fData = model.data[$el.attr('name')];
                        if (fData[alF] && fData[vlF]) {
                            $el.html('<option value="' + fData[vlF] + '" selected>' + fData[alF] + '</option>');
                        }
                        break;
                    default:
                        if ($el.attr('type') == 'checkbox') {
                            $el.prop('checked', model.data[$el.attr('name')] )
                        } else {
                            $el.val(model.data[$el.attr('name')]);
                        }

                }
            }
        });
    }
    this.harvest = function (form) {
        if (form instanceof jQuery) {
            var $form = form;
        } else {
            var $form = $(form);
        }
        $form.find('[name]').each(function(){
            var $el = $(this);
            if ($el.attr('name')) {
                switch($el.data('field-type'))
                {
                    case 'richtext':
                       model.data[$el.attr('name')] =  $el.html();
                       break;
                    case 'tabs':
                       var tabs = [];
                       $el.find('li[data-key]').each(function(){
                           var $tabEl = $(this);
                           var tab = {
                               key: $tabEl.attr('data-key'),
                               type: $tabEl.attr('data-type'),
                               title: $tabEl.find('a').html(),
                               content: $('[data-tab-key="' + $tabEl.attr('data-key') + '"] [data-tab-content]').html()
                           }
                           tabs.push(tab);
                       })
                        model.data[$el.attr('name')] = tabs;
                       break;
                    default:
                       if ($el.attr('type') == 'checkbox') {
                           if ($el.prop('checked')) {
                               model.data[$el.attr('name')] = true;
                           } else {
                               model.data[$el.attr('name')] = false;
                           }
                       } else {
                           model.data[$el.attr('name')] = $el.val();
                       }

                }
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
    this.helpers.fillSelectOptions = function(params) {
        var opts = {
            data: [],
            el: {},
            valueField: false,
            labelField: false,
            selectedValue: false
        }
        $.extend(opts, params);

        if (opts.el instanceof jQuery) {
            var $el = opts.el;
        } else {
            var $el = $(opts.el);
        }

        var $tmpEl = $('<div/>');
        if ((opts.valueField || !opts.data.length) && opts.labelField) {
            if (opts.data.length) {
                for (var i=0; i < opts.data.length; i++) {
                    if (typeof opts.data[i][opts.valueField] !== 'undefined' && typeof opts.data[i][opts.labelField] !== 'undefined') {
                        jQuery('<option/>', {
                            selected: opts.selectedValue ? opts.selectedValue == opts.data[i][opts.valueField] : false,
                            value: opts.data[i][opts.valueField],
                            text:  opts.data[i][opts.labelField]
                        }).appendTo($tmpEl);
                    }
                }
            } else {
                var val;
                for (key in opts.data) {
                    if (typeof opts.data[key][opts.labelField] !== 'undefined') {
                        if (!opts.valueField) {
                            val = key;
                        } else {
                            val = opts.data[key][opts.valueField]
                        }
                        jQuery('<option/>', {
                            selected: opts.selectedValue ? opts.selectedValue == val : false,
                            value: val,
                            text:  opts.data[key][opts.labelField]
                        }).appendTo($tmpEl);
                    }
                }
            }
            $el.empty();
            $tmpEl.children().appendTo($el);
        }

    }
}

module.exports = Model;
