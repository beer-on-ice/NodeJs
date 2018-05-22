var mongoose = require('mongoose')
var bcrypt = require('bcrypt') // 密码加盐
var SALT_WORK_FACTOR = 10 //强度

var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    password: String,
    meta: {
        createAt: {
            type:Date,
            default: Date.now()
        },
        updateAt: {
            type:Date,
            default: Date.now()
        }
    }
})
// 每次在执行save之前执行回调
UserSchema.pre('save',function() {
    var user = this
    if(this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    }
    else {
        this.meta.updateAt = Date.now()
    }

    bcrypt.genSalt(SALT_WORK_FACTOR,function(err,salt) {
        if(err) return next(err)
        bcrypt.hash(user.password,salt,function(err,hash) {
            if(err) return next(err)
            user.password = hash
            next()
        })
    })
})
// 静态方法
UserSchema.statics = {
    fetch: function(cb) {
        return this.find({}).sort('meta.updateAt').exec(cb)
    },
    findById(id,cb) {
        return this.find({_id: id}).exec(cb)
    }
}

module.exports = UserSchema
