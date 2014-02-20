var lapitable = involve('/modules/enhancer/components/lapitable.js');
var Model = involve('/modules/helpers/model.js');
var bundle = involve('/modules/helpers/bundle.js');

var listPages = function (callback) {
    var core = this.core;
    var pagesTable = lapitable();
    var modalsBundleData = [];

    modalsBundleData[0] = function(callback) {
        core.templates.render({
            file: 'pages/templates/admin/modals/extradata.html',
            data: {}
        }, function(answer){
            callback(answer);
        })
    }
    modalsBundleData[1] = function(callback) {
        core.templates.render({
            file: 'pages/templates/admin/modals/deleteconfirm.html',
            data: {}
        }, function(answer){
            callback(answer);
        })
    }
    var modalsBundleCallback = function(answer) {
        $.each(answer, function (){
            $('[data-section="body"]').append(this.text);
        })
        var $newPageForm = $('#newPageForm');
        var $newPageModal = $('#extra-page');
        var $deletePagesModal = $('#delete-pages');

        var newPageModel = new Model({
            save: function (callback) {
                var model = this;
                var returnCall = callback || function (){};
                $('body').lock();
                core.services.call(
                    {
                        name: 'pages',
                        method: 'save',
                        data: this.data
                    },
                    function (answer) {
                        $('body').lock(false);
                        var errorTypes = {
                            'same-alias': 'Страница с таким указателем уже существует. Указатель должен быть уникальным'
                        }
                        var errors = [];
                        if (answer.data.errors) {
                            for (var i=0; i< answer.data.errors.length; i++) {
                                var error = {};
                                error.field = answer.data.errors[i].field;
                                error.message = errorTypes[answer.data.errors[i].type] ? errorTypes[answer.data.errors[i].type] : answer.data.errors[i].type;
                                errors.push(error);
                            }
                            newPageModel.displayErrors($newPageForm, errors);
                        }
                        console.log(answer);
                    }
                )
            },
            valid: function (callback) {
                var model = this;
                var errors = [];

                if (!model.validators.isSet(model.data.title)) {
                    errors.push({
                        field: 'title',
                        message: 'Это поле обязательно'
                    })
                }
                if (!model.validators.isSet(model.data.alias)) {
                    errors.push({
                        field: 'alias',
                        message: 'Это поле обязательно'
                    })
                }
                if (!errors.length) {
                    callback(true);
                } else {
                    callback(errors);
                }

            }
        });

        $newPageModal.on('click','[data-action="save"]', function(e){
            e.preventDefault();
            newPageModel.data = {};
            newPageModel.harvest($newPageForm);
            console.log(newPageModel.data);
            newPageModel.valid(function(errors){
                newPageModel.clearErrors($newPageForm);
                if (errors === true) {
                    newPageModel.save();
                    $newPageModal.modal('hide');
                    core.routeURL(document.location.pathname);
                }
                newPageModel.displayErrors($newPageForm, errors);
            });

        });
        $('[data-action="newpage"]').on('click', function (e) {
            e.preventDefault();
            newPageModel.data = {};
            newPageModel.clearForm($newPageForm);
            $newPageModal.modal('show');
        });

        $deletePagesModal.on('click','[data-action="delete"]', function(e){
            e.preventDefault();
            $('body').lock();
            core.services.call(
                {
                    name: 'pages',
                    method: 'delete',
                    data: pagesTable.getCheckedIDs()
                },
                function (answer) {
                    $('body').lock(false);
                    $deletePagesModal.modal('hide');
                    core.routeURL(document.location.pathname);

                }
            );
        })
        $('[data-action="delete-pages"]').on('click', function (e) {
            e.preventDefault();
            $deletePagesModal.modal('show');
        });
    }
    bundle(modalsBundleData, modalsBundleCallback);

    callback();
}


var editPage = function(callback) {
    var core = this.core;
    $container = $('[data-section="body"]');
    $('body').lock();
    var initEditors = function () {
        $('[data-field-type="richtext"]').attr('contenteditable', 'true').ckeditor();
        core.templates.render({
            file: 'admin/templates/floater.html',
            data: {}
        }, function(answer){
            $container.append(answer.text);
            $('body').lock(false);
        });

        var $extrasModal = $('#extra-page');
        var editPageModel = new Model({
            save: function (callback) {
                var model = this;
                $('body').lock();
                var returnCall = callback || function (){};
                core.services.call(
                    {
                        name: 'pages',
                        method: 'save',
                        data: this.data
                    },
                    function (answer) {
                        $('body').lock(false);
                        var errorTypes = {
                            'same-alias': 'Страница с таким указателем уже существует. Указатель должен быть уникальным'
                        }
                        var errors = [];
                        if (answer.data.errors) {
                            for (var i=0; i< answer.data.errors.length; i++) {
                                var error = {};
                                error.field = answer.data.errors[i].field;
                                error.message = errorTypes[answer.data.errors[i].type] ? errorTypes[answer.data.errors[i].type] : answer.data.errors[i].type;
                                errors.push(error);
                            }
                            editPageModel.displayErrors($container, errors);
                        }
                        console.log(answer);
                    }
                )
            },
            valid: function (callback) {
                var model = this;
                var errors = [];

                if (!model.validators.isSet(model.data.title)) {
                    errors.push({
                        field: 'title',
                        message: 'Это поле обязательно'
                    })
                }
                if (!model.validators.isSet(model.data.alias)) {
                    errors.push({
                        field: 'alias',
                        message: 'Это поле обязательно'
                    })
                }
                if (!errors.length) {
                    callback(true);
                } else {
                    callback(errors);
                }

            }
        });
        editPageModel.data = core.shared.pageData;
        editPageModel.seed($extrasModal);

        $container.on('click', '[data-action="save"]', function (e){
            e.preventDefault();
            $el = this;
            editPageModel.harvest($container);
            editPageModel.save();
        });

        //Additional settings modal
        $extrasModal.on('click', '[data-action="save"]', function (e){
            e.preventDefault();
            editPageModel.harvest($extrasModal);
            $extrasModal.modal('hide');
        });
        $container.on('click', '[data-action="extras"]', function (e){
            e.preventDefault();
            $el = this;
            editPageModel.seed($extrasModal);
            $extrasModal.modal('show');
        })

    }

    core.templates.render({
        file: 'pages/templates/admin/modals/extradata.html',
        data: {}
    }, function(answer){
        $container.append(answer.text);
        if (!$().ckeditor) {
            $.getScript('/web/libs/ckeditor/ckeditor.js', function(){
                $.getScript('/web/libs/ckeditor/adapters/jquery.js', function(){
                    initEditors();
                })
            })
        } else {
            initEditors();
        }
    })

   // console.log(core.shared);

    callback();
}

module.exports = {
    routes: [
        /*{
         pattern: '/page/:keyvalues',
         handler: logData
         },*/
        {
            pattern: '/page/:alias/edit',
            handler: editPage
        },
        {
            pattern: '/admin/pages',
            handler: listPages
        },
        {
            pattern: '/admin/pages/*',
            handler: listPages
        }
    ]
}