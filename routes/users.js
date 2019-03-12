var express = require('express');
var router = express.Router();

var knex = require('knex')({
  dialect:'mysql',
  /*connection:{
    host:process.env.database_host,
    user:process.env.database_user,
    password:process.env.database_password,
    database:process.env.database_schema,
    charset:'utf8'
  }*/
  connection:process.env.CLEARDB_DATABASE_URL
});

var Bookshelf = require('bookshelf')(knex);

var User = Bookshelf.Model.extend({
  tableName: 'users'
});

router.get('/add', (req, res, next) => {
  var data = {
    title: 'Users/Add',
    form:{name:'',password:'',comment:''},
    content:'* Please input name , password and comment'
  }
  res.render('users/add',data);
});

router.post('/add',(req,res,next) => {
  req.check('name','Please enter name').notEmpty();
  req.check('password','Please enter password').notEmpty();
  req.getValidationResult().then((result) => {
    if(!result.isEmpty()){
      var content = '<ul class="error">';
      var result_arr = result.array();
      for(var n in result_arr){
        content += '<li>' + result_arr[n].msg + '</li>'
      }
      content += '</ul>';
      var data = {
        title:'Users/Add',
        content:content,
        form:req.body
      }
      res.render('users/add',data);
    }else{
      req.session.login = null;
      new User(req.body).save().then((model) => {
        res.redirect('/');
      })
    }
  })
});

router.get('/', (req,res,next) => {
  var data = {
    title:'Users/Login',
    form:{name:'',password:''},
    content:'* Please input name and password'
  }
  res.render('users/login',data);
});

router.post('/', (req,res,next) => {
  req.check('name','Please enter name').notEmpty();
  req.check('password','Please enter password').notEmpty();
  req.getValidationResult().then((result)=>{
    if(!result.isEmpty()){
      var content = '<ul class="error">';
      var result_arr = result.array();
      for(var n in result_arr){
        content += '<li>' + result_arr[n].msg + '</li>'
      }
      content += '</ul>';
      var data = {
        title:'Users/Login',
        content:content,
        form:req.body
      }
      res.render('users/login',data);
    }else{
      var nm = req.body.name;
      var pw = req.body.password;
      User.query({where:{name:nm}, andwhere: {password:pw}})
          .fetch()
          .then((model) => {
            if(model == null){
              var data = {
                title:'Please enter again',
                content:'<p class="error">name or password is invalid</p>',
                form:req.body
              };
              res.render('users/login',data)
            }else{
              req.session.login = model.attributes; 
              var data = {
                title:'Users/Login',
                content:'<p>Logined!<br>Please go ba back to top page and submit the message',
                form:req.body
              };
              res.render('users/login',data);
            }
          });
    }
  });
});


module.exports = router;
