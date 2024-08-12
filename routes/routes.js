const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const users = require('../models/users');

//image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads');
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
  });
  

var upload = multer({
    storage: storage,
}).single('image');

//insert an user in to database route
router.post('/add', upload, async (req, res)=>{

    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename
        });
        await user.save();

        req.session.message = {
            type: 'success',
            message: 'User added successfully'
        };
        res.redirect("/")

    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

//get all users
router.get("/", (req,res)=>{
    User.find().exec((err, users))
});



router.get("/", (req,res)=>{
    res.render('index', { title: 'Home page'});
});

router.get("/add", (req,res)=>{
    res.render("add_users", {title: 'Add users'});
});

module.exports = router;