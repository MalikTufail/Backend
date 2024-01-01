var express = require('express');
var router = express.Router();
const userModel = require('./users')
const postModel = require('./posts')
const passport = require('passport')
const localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()))
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login' ,function(req, res, next) {
  // console.log(req.flash('error'))
  res.render('login', {error: req.flash('error')});
});

router.get('/profile', isLoggedIn, function(req, res, next) {
  res.render('profile');
});

// router.get('/feed' ,function(req, res, next) {
//   res.render('feed')
// });

router.get('/register',function(req, res, next) {
  res.render('register')
});


router.post('/register', async function(req, res){
  const {username, email, fullname} = req.body;
  const userData = new userModel({username, email, fullname})
  userModel.register(userData, req.body.password).then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect('/profile')
    })
  })

  router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }),async function(req, res){
    
    })
router.get('/logout', function(req, res) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  })
})

  // let userData = await userModel.create({
  //     username: req.body.username,
  //     email: req.body.email,
  //     fullName: req.body.fullname,
  //   });
    
      // res.send(userData);
})

function isLoggedIn (req, res, next) {
  if(req.isAuthenticated()) return next();
  res.redirect('/login');
}

// router.get('/allposts', async function(req, res, next) {
//   let user = await userModel
//   .findOne({_id: "6582c7487ed9a9cfa911077d"}).populate('posts')
//   res.send(user)
// });

// router.get('/createuser', async function(req, res, next) {
// let createduser = await userModel.create({
//   username: "Tufail",
//   password: "tufail",
//   posts: [],
//   email: "tufail@mail.com",
//   fullName: "Muhammad Tufail",
// });

//   res.send(createduser);
// });

// router.get('/createpost', async function(req, res, next) {
//  let createdpost = await postModel.create({
//     postText: "This is my second post",
//     user: "6582c7487ed9a9cfa911077d" 
//   })
//   let user = await userModel.findOne({_id: "6582c7487ed9a9cfa911077d"});
//   user.posts.push(createdpost);
//   await user.save();
//   res.send('done')
// });

module.exports = router;
