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
  hasTimestamps: true,
  user: function(){
    return this.belongTo(User)
  }
});

router.get('/',(req,res,next)=>{
  res.redirect('/');
});

router.get('/:id',(req,res,next)=>{
  res.redirect('/home/'+req.params.id+'/1');
});

router.get('/:id/:page',(req,res,next)=>{
  var id = req.params.id;
  id *= 1;
  var pg = req.params.page;
  pg *= 1;
  if(pg < 1){
    pg = 1;
  }  
  new Message().orderBy('created_at','DESC')
               .where('user_id','=',id)
               .fetchPage({page:pg,pageSize:10,withRelated:['user']})
               .then((collection)=>{
                var data = {
                  title:'miniboard',
                  login:req.session.login,
                  collection:collection.toArray(),
                  pagination:collection.pagination
                }
                res.render('home',data);
               })
   .catch((err)=>{
     res.status(500).json({error:true,data:{message:err.message}});
   });
  
});
