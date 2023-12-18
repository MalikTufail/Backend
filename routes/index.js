var express = require('express');
var router = express.Router();
const userModel = require("./users")

// route and session created
// router.get('/', function (req, res) {
//   req.session.ban= true;
//   res.render('index')
// })

// setting up cookie  

router.get('/', function (req, res) {
  res.cookie("age", 25)
  res.render('index')
})

//reading cookies

router.get("/read-cookie", function (req, res) {
  console.log(req.cookies.age)
  res.send('check')
})

//deleting cookie
router.get('/delete-cookie', function (req, res) {
  res.clearCookie(res.cookie.age)
  res.send('cookie cleared')
})

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
