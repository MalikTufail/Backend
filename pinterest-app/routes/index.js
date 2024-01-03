var express = require('express');
var router = express.Router();
const userModel = require('./users')
const postModel = require('./posts')
const passport = require('passport')
const localStrategy = require('passport-local')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const upload = require('./multer')
require('dotenv').config();
passport.use(new localStrategy(userModel.authenticate()))
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login' ,function(req, res, next) {
  // console.log(req.flash('error'))
  res.render('login', {error: req.flash('error')});
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate("posts")
  res.render('profile', {user});
});

router.get('/feed' ,function(req, res, next) {
  res.render('feed')
});

router.post('/upload', isLoggedIn, upload.single("file") , async function(req, res, next) {
  if(!req.file) {
    return res.status(404).send('no files were given')
  }
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    image: req.file.filename,
    imageText: req.body.filecaption,
    detail: req.body.detail,
    user: user._id
  })
  user.posts.push(post._id)
  await user.save()
  res.redirect('/profile')
});

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
  // let userData = await userModel.create({
  //     username: req.body.username,
  //     email: req.body.email,
  //     fullName: req.body.fullname,
  //   });
    
      res.send({
        success: true,
        message: 'Account created successfully',
        data:{
        email: email,
        user: username,
        fullname: fullname,
      }
      });
})
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/profile');
  }
);

router.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/profile');
  }
);

  router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }), async function(req, res){
    if (req.isAuthenticated()) {
      const username = req.user.username;
      return res.send({
        success: true,
        message: 'Login successful',
        data: {
          user: username,
        }
      });
    } else {
      return res.send({
        success: false,
        message: 'Login failed',
        data: {
          error: 'Invalid credentials',
        }
      });
    }
  })
  
router.get('/logout', function(req, res) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  })
})

function isLoggedIn (req, res, next) {
  if(req.isAuthenticated()) return next();
  res.redirect('/login');
}



passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // Check if the user already exists in your database or create a new one
    // Example: userModel.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return done(err, user);
    // });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // Check if the user already exists in your database or create a new one
    // Example: userModel.findOrCreate({ facebookId: profile.id }, function (err, user) {
    //   return done(err, user);
    // });
  }
));

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
