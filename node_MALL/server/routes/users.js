var express = require('express');
var router = express.Router();
var Users = require('./../models/users');
require('./../util/util');

var responseData;

router.use((req, res, next) => {
  responseData = {
    status: "0",
    msg: ''
  };
  next();
})

// 登录
router.post('/login', function(req, res, next) {
  let param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  if(param.userName == '' || param.userPwd == '') {
      responseData.status = "1";
      responseData.msg = "账号或密码不能为空！";
      res.json(responseData);
      return;
  }
  Users.findOne(param).then((doc) => {
      if(!doc) {
          responseData.status = "2";
          responseData.msg = "账号或密码错误！"
          res.json(responseData);
          return;
      }
      else{
          res.cookie("userId",doc.userId,{
              path:'/',
              maxAge: 1000*60*60
          });
          res.cookie("userName",doc.userName,{
              path:'/',
              maxAge: 1000*60*60
          });
          responseData.status = "0";
          responseData.msg = "";
          responseData.result = {
              nickName: doc.userName
          };
          res.json(responseData);
      }
  });
});

// 登出
router.get('/logout',(req,res,next)=>{
    res.cookie("userId","",{
        path: '/',
        maxAge: -1
    });
    responseData.status = "0";
    responseData.msg = "";
    responseData.result = "";
    res.json(responseData);
});

// 是否已登陆（缓存）
router.get('/checkLogin',function(req,res,next) {
    if(req.cookies.userId) {
        responseData.status = "0";
        responseData.msg = "";
        responseData.result = req.cookies;
        res.json(responseData);
    } else {
        responseData.status = "1";
        responseData.msg = "未登录";
        responseData.result = "";
        res.json(responseData);
    }
});

// 购物车数量
router.get("/getCartCount",(req,res,next)=>{
    if(req.cookies && req.cookies.userId) {
        let userId = req.cookies.userId;
        Users.findOne({userId:userId}).then(doc=>{
            let cartList = doc.cartList;
            let cartCount = 0;
            cartList.forEach(item=>{
                cartCount += parseInt(item.productNum)
            })
            responseData.status = "0";
            responseData.msg = "";
            responseData.result = cartCount;
            res.json(responseData);
        });
    }
});

// 购物车列表
router.get('/cartList',(req,res,next)=> {
    let userId = req.cookies.userId;
    Users.findOne({userId: userId}).then((doc)=>{
        if(!doc) {
            responseData.status = "1";
            responseData.msg = "查无此人";
            responseData.result = "";
            res.json(responseData);
            return;
        }
        else {
            responseData.status = "0";
            responseData.msg = "";
            responseData.result = doc.cartList;
            res.json(responseData);
            return;
        }
    })
});

// 购物车删除
router.post('/cart/del',(req,res,next)=>{
    let userId = req.cookies.userId;
    let productId = req.body.productId;
    /* 方法一：  */
    // Users.findOne({userId:userId}).then((doc)=>{
    //     doc.cartList = doc.cartList.filter((item)=>{
    //         return item.productId !== productId
    //     })
    //     doc.save().then(()=>{
    //         responseData.status = 0;
    //         responseData.msg = '';
    //         responseData.result = 'success'
    //         res.json(responseData);
    //     });
    // })

    /* 方法二：  */
    Users.update({
        userId:userId
    },{
        $pull:{
            "cartList":{
                'productId':productId
            }
        }
    }).then((doc)=>{
        responseData.status = "0";
        responseData.msg = "删除成功";
        responseData.result = "";
        res.json(responseData);
    });
});

// 修改商品数量
router.post('/cart/edit',(req,res,next)=>{
    let userId = req.cookies.userId;
    let productId = req.body.productId;
    let productNum = req.body.productNum;
    let checked = req.body.checked;
    Users.update({
        "userId":userId,
        "cartList.productId": productId
    },{
        "cartList.$.productNum":productNum,
        "cartList.$.checked": checked
    }).then((doc)=>{
        responseData.status = "0";
        responseData.msg = "";
        responseData.result = "";
        res.json(responseData);
    });
});

// 全选
router.post('/cart/editCheckAll',(req,res,next)=>{
    let userId = req.cookies.userId;
    let checkAll = req.body.checkAll;
    Users.findOne({userId:userId}).then((doc)=>{
        doc.cartList .forEach((item)=>{
            item.checked = checkAll;
        });
        doc.save().then((doc)=>{
            responseData.status = "0";
            responseData.msg = "";
            responseData.result = "";
            res.json(responseData);
        })
    })
});

// 查询用户地址
router.get('/addressList',(req,res,next)=>{
    let userId = req.cookies.userId;
    Users.findOne({userId:userId}).then((doc)=>{
        responseData.status = "0";
        responseData.msg = "";
        responseData.result = doc.addressList;
        res.json(responseData);
    })
})

// 设置默认地址
router.post('/addressList/setdefault',(req,res,next)=>{
    let addressId = req.body.addressId;
    let userId = req.cookies.userId;
    Users.findOne({userId: userId}).then((userDoc)=>{
        let addressList = userDoc.addressList;
        addressList.forEach((item)=>{
            if(item.addressid == addressId) {
                item.isDefault = true;
            } else {
                item.isDefault = false;
            }
        });
        userDoc.save((doc)=>{
            responseData.status = "0";
            responseData.msg = "";
            responseData.result = "";
            res.json(responseData);
        })
    });
});

// 删除地址
router.post('/addressList/delAddress',(req,res,next)=>{
    let userId = req.cookies.userId;
    let addressId = req.body.addressId;
    Users.update({userId:userId},{$pull:{'addressList':{'addressid':addressId}}}).then((doc)=>{
        responseData.status = "0";
        responseData.msg = "删除成功！";
        responseData.result = "";
        res.json(responseData);
    });

});

// 支付
router.post('/payment',(req,res,next)=>{
    let userId = req.cookies.userId;
    let orderTotal = req.body.orderTotal;
    let addressId = req.body.addressId;

    Users.findOne({userId:userId}).then( doc => {
        let address = '';
        let goodslist = [];
        // 获取当前地址
        doc.addressList.forEach(item =>{
            if(addressId == item.addressid) {
                address = item;
            }
        });
        // 获取购买的商品
        doc.cartList.filter(item =>{
            if(item.checked == "1") {
                goodslist.push(item);
            }
        });

        //  生成订单号
        let platform = 'genius-';
        //  随机数
        let r1 = Math.floor(Math.random()*10);
        let r2 = Math.floor(Math.random()*10);

        // 时间
        let systemDate = new Date().Format('yyyyMMddhhmmss');
        let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');

        let orderId = platform + r1 + systemDate + r2;
        let order = {
            orderId: orderId,
            orderTotal: orderTotal,
            addressInfo: address,
            goodsList: goodslist,
            orderStatus: "1",
            createDate: createDate
        }

        doc.orderList.push(order);

        doc.save().then(doc1=>{
            responseData.status = "0";
            responseData.msg = "";
            responseData.result = {
                orderId: order.orderId,
                orderTotal: order.orderTotal
            };
            res.json(responseData);
         })

    });
});

// 订单成功
router.get('/orderDetail',(req,res,next)=>{
    let orderId = req.query.orderId;
    let userId = req.cookies.userId;
    let order = '';
    Users.findOne({userId:userId}).then(doc=>{
        doc.orderList.forEach(item=>{
            if(item.orderId == orderId) {
                order = item;
            }
        });
        if(order) {
            responseData.status = "0";
            responseData.msg = "";
            responseData.result = order.orderTotal;
            res.json(responseData);
        }
        else {
            responseData.status = "1";
            responseData.msg = "无此订单！";
            responseData.result = "";
            res.json(responseData);
        }
    })

});

module.exports = router;
