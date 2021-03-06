const cp = require('child_process')
const {resolve} = require('path')
// 抓取豆瓣电影列表数据 -子进程
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')

;(async () => {
  const script = resolve(__dirname, '../crawler/trailer-list.js')
  // 只有使用fork才可以使用message事件和send()方法
  const child = cp.fork(script, [])
  let invoked = false

  child.on('err', err => {
    if (invoked) return
    invoked = true
    console.log(err)
  })

  child.on('exit', code => {
    if (invoked) return
    invoked = true
    let err = code === 0 ? null : new Error('exit code ' + code)
    console.log(err)
  })

  child.on('message', data => {
    let result = data.result
    result.forEach(async item => {
      let movie = await Movie.findOne({
        doubanId: item.doubanId
      })
      if (!movie) {
        movie = new Movie(item)
        await movie.save()
      }
    })
  })
})()
