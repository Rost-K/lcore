var lapitable = function () {
    var $table = $('.lapitable');
    var checkRow = function ($row, state) {
        if (typeof state == 'undefined') {
            state = !$row.data('checked');
        }
        $row.data('checked',state).toggleClass('checked', state);
    }

    $table.on('click','tbody tr', function  (){
        $el = $(this);
        checkRow($el);
    });
    $table.on('click','tbody tr .unchecked-icon', function  (){
        $el = $(this).parents('tr');
        checkRow($el, false);
    });
    $table.on('click','tbody tr .checked-icon', function  (){
        $el = $(this).parents('tr');
        checkRow($el, true);
    })

    $table.getCheckedIDs = function () {
        var retArr = [];
        $table.find('tbody tr').each(function(){
            if ($(this).data('checked')) {
                retArr.push($(this).data('id'));
            }
        })
        return retArr;
    }
    return $table;
}

module.exports = lapitable;
