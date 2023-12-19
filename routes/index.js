var express = require('express');
var router = express.Router();
const userModel = require("./users")
const passport = require('passport');
const localStrategy = require('passport-local');

passport.use(new localStrategy(userModel.authenticate()))

router.get('/', function (req, res) {
  res.render('index');
})

router.get('/profile', isLoggedIn, function(req, res)  {
  res.render('profile')
})

router.post('/register', function(req, res) {
  var userdata = new userModel({
    username: req.body.username,
    secret: req.body.secret
  })
  userModel.register(userdata, req.body.password)
  .then(function(registereduser){
    passport.authenticate("local")(req,res, function(){
      res.redirect('/profile')
    })
  })
})


router.post('/login', passport.authenticate("local", {
  successRedirect:"/profile",
  failureRedirect: "/"
}), function(req, res) {})

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {return next(err);}
    res.redirect('/')
  })
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/')
}

// router.get('/create', async function (req, res){
//  const userData =  await userModel.create({
//     username: "awais",
//     nickname : "awaisooo",
//     description: "I love to code in any language, node and react",
//     categories: ['java', 'android', 'selenium', 'automation', 'js', 'Node'],
//   })
//   res.send(userData)
// })
// searching faiq case insensitive
// router.get('/find', async (req, res) => {
//   var regex = new RegExp('Faiq', 'i');
//   let user = await userModel.find({ username: regex})
//   res.send(user)
// })

//searching one item from categories
// router.get('/find', async (req, res) => {
//   // var regex = new RegExp('Faiq', 'i');
//   let user = await userModel.find({categories: {
//     $all:['js']
//   }})
//   res.send(user)
// })

// search for a field if exists

// router.get('/find', async (req, res) => {
//   // var regex = new RegExp('Faiq', 'i');
//   let user = await userModel.find({categories: {$exists:true }})
//   res.send(user)
// })

//searching a specific length field

// router.get('/find', async (req, res) => {
//   // var regex = new RegExp('Faiq', 'i');
//   let user = await userModel.find({
//     $expr: {
//       $and: [
//         { $gte: [{ $strLenCP: '$nickname' }, 0] },
//         { $lte: [{ $strLenCP: '$nickname' }, 12] }
//     ]
//   }
// })
//   res.send(user)
// })


//search in the date range

// router.get('/find', async (req, res) => {
//   var date1 = new Date('2023-12-17');
//   date1.setHours(10, 50, 8, 337);
//   var formattedDate = date1.toISOString().slice(0, -1);
//   var date2 = new Date('2023-12-18');
//   date2.setHours(10, 50, 8, 337);
//   var formattedDate2 = date2.toISOString().slice(0, -1);
  
//   let user = await userModel.find({ datecreated: {$gte: formattedDate, $lte: formattedDate2 }})
//   res.send(user)
// })

// route and session created
// router.get('/', function (req, res) {
//   req.session.ban= true;
//   res.render('index')
// })

// setting up cookie  

// router.get('/', function (req, res) {
//   res.cookie("age", 25)
//   res.render('index')
// })

//using of flash-connect
// router.get('/', function (req, res) {
//   res.render('index')
// })

// router.get('/failed', function (req, res) {
//   req.flash("age", 25)
//   res.send('flash initiated')
// })
// router.get('/checkflash', function (req, res) {
//   console.log(req.flash("age"))
//   res.send('check read in other route')
// })

//reading cookies

// router.get("/read-cookie", function (req, res) {
//   console.log(req.cookies.age)
//   res.send('check')
// })

//deleting cookie
// router.get('/delete-cookie', function (req, res) {
//   res.clearCookie(res.cookie.age)
//   res.send('cookie cleared')
// })

//session read
// router.get('/banned', function (req, res) {
//   if(req.session.ban === true) {
//     res.send('you are banned')
//   }  
// })

// session destroyed
// router.get('/removebann', function (req, res) {
//   req.session.destroy(function(err) {
//     if (err) throw(err)
//     res.send('bann removed') 
//   })
//   // console.log(req.session)
  
// })

// model created
// router.get('/create', async function (req, res) {
//   const createdUser = await  userModel.create({
//     username: "Tufail",
//     name: "Khalil",
//     age: 28
//   })
//   res.send(createdUser)
// })

//model all users read
// router.get('/users', async function (req, res) {
//   const allUsers = await userModel.find();
//   res.send(allUsers)
// })

//model one user read
// router.get('/findOne', async function (req, res) {
//   const allUsers = await userModel.findOne({
//     username: "Tufail"
//   });
//   res.send(allUsers)
// })

//model delete user
// router.get('/delete', async function (req, res) {
//   const deletedUsers = await userModel.findOneAndDelete({
//     username: "Tufail"
//   });
//   res.send(deletedUsers)
// })
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
