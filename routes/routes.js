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
router.get("/", async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render('index', {
            title: 'Home Page',
            users: users,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});




router.get("/", (req,res)=>{
    res.render('index', { title: 'Home page'});
});

router.get("/add", (req,res)=>{
    res.render("add_users", {title: 'Add users'});
});


//edit an user
router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        
        if (user == null) {
            res.redirect('/');
        } else {
            res.render("edit_users", {
                title: 'Edit user',
                user: user,
            });
        }
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});
module.exports = router;