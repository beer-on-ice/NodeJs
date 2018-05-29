// 电影列表删除按钮点击
$(function() {
    $('.del').click(function(e) {
        var target = $(e.target)
        var id = target.data('id')
        var tr = $('.item-id-'+id)
        $.ajax({
            type: 'DELETE',
            url: '/admin/movielist?id=' + id
        }).done(function(result) {
            if(result.success == 1) {
                if(tr.length > 0 ){
                    tr.remove()
                }
            }
        })
    })
})
