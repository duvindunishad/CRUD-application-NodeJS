const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const users = require('../models/users');
const fs = require('fs');

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

//update user route
router.post("/update/:id", upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;
            try {
                fs.unlinkSync("./uploads/" + req.body.old_image);
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        const result = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        if (!result) {
            res.json({ message: 'User not found', type: 'danger' });
            return;
        }

        req.session.message = {
            type: 'success',
            message: 'User updated successfully!',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// delete user route
router.get('/delete/:id',async(req,res)=>{
    try{
        let id = req.params.id;
        const result = await User.findByIdAndDelete(id);
        if(result && result.image !== ''){
            try{
                fs.unlinkSync('./uploads/'+result.image);
            }catch(err){
                console.log(err);
            }
        }
        req.session.message = {
            type: 'info',
            message: 'User deleted successfully!',
        };
        res.redirect('/');

    }catch(err){
        res.json({ message: err.message});
    }
});
module.exports = router;