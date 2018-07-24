const Koa = require('koa')
const views = require('koa-views')
const {resolve} = require('path')
const {connect, initSchemas} = require('./database/init')
const router = require('./routes/movie')
const app = new Koa()

;(async () => {
  await connect()
  initSchemas()
  // require('./tasks/movie') // 获取电影列表
  require('./tasks/api') // 获取每部电影详情
})()

app.use(router.routes()).use(router.allowedMethods())

app.use(views(resolve(__dirname, './views'), {
  extension: 'pug' // 扩展名为pug的就会识别为模板文件
}))

app.use(async (ctx, next) => {
  await ctx.render('index', {
    you: 'Visitor',
    me: 'GENIUS'
  })
})
app.listen(8088)