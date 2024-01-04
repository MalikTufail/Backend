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
  const {username, email, fullname, password} = req.body;

  try {
    const userData = new userModel({username, email, fullname});
    await userModel.register(userData, password);

    passport.authenticate("local")(req, res, function(){
      res.redirect('/profile');
    });
  } catch (error) {
    // Handle registration error
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// router.post('/register', async function(req, res){
//   const {username, email, fullname} = req.body;
//   const userData = new userModel({username, email, fullname})
//   userModel.register(userData, req.body.password).then(function(){
//     passport.authenticate("local")(req, res, function(){
//       res.redirect('/profile')
//     })
//   })
//   // let userData = await userModel.create({
//   //     username: req.body.username,
//   //     email: req.body.email,
//   //     fullName: req.body.fullname,
//   //   });
    
//       res.send({
//         success: true,
//         message: 'Account created successfully',
//         data:{
//         email: email,
//         user: username,
//         fullname: fullname,
//       }
//       });
// })
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

// router.post('/login', function(req, res, next) {
//   passport.authenticate('local', function(err, user, info) {
//     if (err) { return next(err); }
//     if (!user) { 
//       return res.json({
//         success: false,
//         message: 'Login failed',
//         data: null
//       });
//     }
//     req.logIn(user, function(err) {
//       if (err) { return next(err); }
//       return res.json({
//         success: true,
//         message: 'Login successful',
//         data: {
//           user: req.user.username
//         }
//       });
//     });
//   })(req, res, next);
// });


  router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }), async function(req, res){

    res.json({
      success: true,
      message: 'Login successful',
    });
    // if (req.isAuthenticated()) {
    //   res.json({
    //     success: true,
    //     message: 'Login successful',
    //   });      
    //   res.redirect('/profile')
    // } else {
    //   return res.send({
    //     success: false,
    //     message: 'Login failed',
    //     data: {
    //       error: 'Invalid credentials',
    //     }
    //   });
    // }
  })
  
router.get('/logout', function(req, res) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  })
})

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback'
},
async function(accessToken, refreshToken, profile, done) {
  try {
    // Check if the user already exists in the database by email
    let user = await userModel.findOne({ email: profile.emails[0].value });

    if (user) {
      // If the user already exists, log them in
      return done(null, user);
    }

    // If the user doesn't exist, create a new one
    user = await userModel.create({
      googleId: profile.id,
      username: profile.displayName,
      email: profile.emails[0].value, // Assuming the first email is the primary one
      fullname: profile.displayName, // You may need to adjust this based on Google profile data
    });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}
));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: 'http://localhost:3000/auth/facebook/callback'
},
async function(accessToken, refreshToken, profile, done) {
  try {
    // Check if the user already exists in the database
    let user = await userModel.findOne({ facebookId: profile.id });

    if (!user) {
      // If the user doesn't exist, create a new one
      user = await userModel.create({
        facebookId: profile.id,
        username: profile.displayName,  // You may need to adjust this based on Facebook profile data
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
  // Check if the user already exists in your database or create a new one
  // Example: userModel.findOrCreate({ facebookId: profile.id }, function (err, user) {
  //   return done(err, user);
  // });
}
));

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
