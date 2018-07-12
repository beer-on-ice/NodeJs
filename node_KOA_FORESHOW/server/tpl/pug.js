module.exports = `
doctype html
html
  head
    meta(charset="utf-8")
    meta(name="viewport",content="width=device-width,initial-scale=1")
    title Koa Server Html
    link(href="https://cdn.bootcss.com/bootstrap/4.1.1/css/bootstrap.min.css" rel="stylesheet")
    script(src="https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js")
    script(src="https://cdn.bootcss.com/bootstrap/4.1.1/js/bootstrap.bundle.min.js")
  body
    div.container
      div.row
        div.col-md-8
          h1 Hi, #{you}
          p This is #{me}
        div.col-md-4
            p 测试动态 PUG 页面
`
