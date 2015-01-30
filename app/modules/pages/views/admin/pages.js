var lapitable = involve('/modules/enhancer/components/lapitable.js');
var Model = involve('/modules/helpers/model.js');
var createModal = involve('/modules/helpers/makemodal.js');
var fileList = involve('/modules/helpers/filelist/filelist.js');

var editGroup =  involve('/modules/pages/views/admin/editgroup.js');

var editPage = function(callback) {
    var core = this.core;
    $container = $('#data-container');
    $aux_container = $('#aux');
    var modals = {};
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
                    } else {
                        core.routeURL('/page/' + editPageModel.data.alias);
                    }

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

    $('body').lock();
    var tabEditorInit =  involve('/modules/pages/views/admin/tabeditor.js');
    var initEditors = function () {
        var tplRen = $.Deferred();

        $('.nav-tabs a').on('shown.bs.tab', function (e) {
            $($(e.target).attr('href')).find('[data-field-type="richtext"]').attr('contenteditable', 'true').ckeditor();
        });
        $('[data-field-type="richtext"]:visible').attr('contenteditable', 'true').ckeditor();
        var ret = $.when(
            tabEditorInit({
                aux: $aux_container,
                container: $container
            }),
            tplRen
        ).done(function(){
            editPageModel.seed(editPageModel.el);
            $container.on('click', '[data-action="set-intro-image"]', function (e){
               modals.setFile.modal('show');
            });

            $aux_container.on('click', '.admin-floater [data-action="save"]', function (e){
                e.preventDefault();
                $el = this;
                editPageModel.harvest($container);
                editPageModel.save();
            });

            $aux_container.on('click', '.admin-floater [data-action="extras"]', function (e){
                e.preventDefault();
                $el = this;
                editPageModel.seed(editPageModel.el);
                editPageModel.el.modal('show');
            })
        })

        core.templates.render({
            file: 'admin/templates/floater.html',
            data: {}
        }, function(answer){
            $(answer.text).appendTo($aux_container);
            $('[data-section="body"]').addClass('edit').lock(false);
            tplRen.resolve();
        });

        return ret;
    }

    var modalsBundleCallback = function() {
        if (!$().ckeditor) {
            $.when(
                $.getScript('/web/libs/ckeditor/ckeditor.js')
            ).done(function(){
                    $.getScript('/web/libs/ckeditor/adapters/jquery.js').done(initEditors);
            });

        } else {
            initEditors();
        }
    }

    $.when(
        createModal({  //Create Modal for Files list
            title: '<i class="fa fa-file-text-o"></i> Файлы',
            width: 'full',
            content: {
                html: '<div class="file-list-container"></div>'
            },
            buttons: [
                {
                    class: 'btn-default',
                    dismiss: 'true',
                    text: 'Не надо'
                },
                {
                    class: 'btn-primary',
                    text: 'Готово',
                    handler: function (e){
                        var $modal = $(this);
                        e.preventDefault();
                      //  editPageModel.harvest($modal);
                        $modal.modal('hide');
                    }
                }
            ],
            core: core
        }).done(
            function(){
                modals.selectFeaturedFilelist = $(this);
                var el = $(this).find('.file-list-container')

                fileList({
                    core: core,
                    el: el,
                    listService: {
                        method: "getAttachedFiles",
                        name: "pages",
                        data: {
                            page_id: core.shared.pageData._id
                        }
                    },
                    uploadService: {
                        method: "attachFiles",
                        name: "pages",
                        data: {
                            page_id: core.shared.pageData._id
                        }
                    },
                    menuItems: [{
                        label: 'Выбрать',
                        icon: 'fa-check-square-o',
                        handler: function(file) {
                            modals.setFile.curfile = file._id;
                            modals.setFile.find('.modal-body').html('<img data-resp="true" class="img-responsive resp" src="/image/bp-2/' + file._id + '">')
                            modals.selectFeaturedFilelist.modal('hide');
                        }
                    }]


                });
            }
        ),
        createModal({  //Create Modal for page extra data
            title: '<i class="fa fa-file-text-o"></i> Создать страницу',
            content: {
                template: {
                    file: 'pages/templates/admin/modals/extradata.html',
                    data: {
                        showType: true
                    }
                }
            },
            buttons: [
                {
                    class: 'btn-default',
                    dismiss: 'true',
                    text: 'Не надо'
                },
                {
                    class: 'btn-primary',
                    text: 'Готово',
                    handler: function (e){
                        var $modal = $(this);
                        e.preventDefault();
                        editPageModel.harvest($modal);
                        $modal.modal('hide');
                    }
                }
            ],
            core: core
        }).done(
            function(){
                editPageModel.el = this;
            }
        ),
        createModal({  //Create Modal change file
            title: '<i class="fa fa-file-text-o"></i> Заглавная картинка',
            content: {
                html: editPageModel.data.bigdealimg ? '<img data-resp="true" class="img-responsive resp" src="/image/bp-2/' + editPageModel.data.bigdealimg + '">' : ''
            },
            buttons: [
                {
                    class: 'btn-primary pull-left',
                    label: '<i class="fa fa-th-list fa-lg"></i>',
                    text: 'Выбрать',
                    handler: function (e){
                        var $modal = $(this);
                        e.preventDefault();
                      /*  editPageModel.harvest($modal);
                        $modal.modal('hide');  */
                        modals.selectFeaturedFilelist.modal('show');
                    }
                },
                {
                    class: 'btn-warning pull-left',
                    label: '<i class="fa fa-eraser fa-lg"></i>',
                    text: 'Очистить',
                    handler: function (e){
                        var $modal = $(this);
                        e.preventDefault();
                        editPageModel.harvest($modal);
                        $modal.modal('hide');
                    }
                },
                {
                    class: 'btn-default',
                    label: '<i class="fa fa-undo fa-lg"></i>',
                    dismiss: 'true',
                    text: 'Не надо'
                },
                {
                    class: 'btn-primary',
                    label: '<i class="fa fa-check fa-lg"></i>',
                    text: 'Готово',
                    handler: function (e){
                        var $modal = $(this);
                        e.preventDefault();
                        $('.big-deal').css('background-image', modals.setFile.curfile ? 'url(/image/bp-4/' + modals.setFile.curfile + ')' : 'url("/web/img/bd3.png"')
                        editPageModel.data.bigdealimg = modals.setFile.curfile;
                       // editPageModel.harvest($modal); */
                        $modal.modal('hide');
                    }
                }
            ],
            core: core
        }).done(
            function(){
                modals.setFile = this;
                modals.setFile.curfile = editPageModel.data.bigdealimg;

            }
        )
    ).done(modalsBundleCallback);

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
            pattern: '/admin/pages/:keyvalues',
            handler: editGroup
        }
    ]
}