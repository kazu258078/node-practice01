var express = require('express');
var router = express.Router();
var knex = require('knex')({
  dialect:'mysql',
  connection:{
    host:process.env.database_host,
    user:process.env.database_user,
    password:process.env.database_password,
    database:process.env.database_schema,
    charset:'utf8'
  }
});
var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('pagination');

var User = Bookshelf.Model.extend({
  tableName:'users'
});

var Message = Bookshelf.Model.extend({
  tableName:'messages',
  hasTimestamps:true,
  user:function(){
    return this.belongsTo(User);
  }
});

router.get('/', function(req, res, next) {
  if(req.session.login == null){
    res.redirect('/users');
  }else{
    res.redirect('/1');
  }
});

router.get('/:page', function(req, res, next) {
  console.log('-----------page-----------------'+ req.params.page +'--------------------------------');
   if(req.session.login == null){
    res.redirect('/users');
     return;
  }
  var pg = req.params.page;
  pg *=1;
  if(pg < 1){
    pg=1;
  }
  new Message().orderBy('created_at','DESC')
    .fetchPage({page:pg,pageSize:10,withRelated:['user']})
    .then((collection)=>{
      console.log('-----------collection-----------------'+ collection.toArray() +'--------------------------------');
      var data ={
        title:'miniboard',
        login:req.session.login,
        collection:collection.toArray(),
        pagination:collection.pagination
      };
    res.render('index',data);
  }).catch((err)=>{
    res.status(500).json({error:true,data:{message:err.message}});
  });
});

router.post('/', function(req, res, next) {
  console.log('-----------message-----------------'+ req.body.msg +'--------------------------------');
  var rec ={
    message:req.body.msg,
    user_id:req.session.login.id
  }
  new Message(rec).save().then((model)=>{
    res.redirect('/');
  })
});

router.get('/api/logout',(req,res,next)=>{
  console.log('-----------session.destroy-----------------');
  req.session.destroy();
  //res.redirect('/');
  var data = {
    title:'You are Logged Out',
    form:{name:'',password:''},
    content:'* Please input name and password'
  }
  res.render('users/login',data);
});


module.exports = router;
