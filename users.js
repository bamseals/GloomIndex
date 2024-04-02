// Sam Beals - CIS 371 Auth Project
const express = require('express')
const mongoose = require('mongoose')
const crypto = require('crypto')
const pbkdf2 = require('pbkdf2')

const { checkAuth } = require('./auth.js')

userRoutes = express.Router()

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema)

// get all users
userRoutes.get('/users', 
    checkAuth,
    async function(req, res) {
        const users = await User.find({})
        let userHTML = users.map(user => {
            return `
                <span>${user.username}</span>
                <button data-id="${user._id}" class="editBtn">edit</button>
                <button data-id="${user._id}" class="deleteBtn">delete</button>
                <input id="newName_${user._id}" class="hide" placeholder="New Username"/>
                <input id="newPass_${user._id}" class="hide" placeholder="New Password" type="password"/>
                <button id="saveEditBtn_${user._id}" data-id="${user._id}" class="saveEditBtn hide">save</button>
            `
        })
        res.render('manage', {users: userHTML })
});

// get one user by id
userRoutes.get('/users/:id', 
    checkAuth, 
    async function(req, res) {
        try {
            const id = req.params.id
            const user = await User.findById(id)
            if (!user) {
                res.status(404).send("User not found.");
                return;
            }
            res.json(user);
        } catch (e) {
            res.status(500).send(`Error loading user id: ${e}`)
        }
});

// add new user
userRoutes.post('/users', 
    function(req, res) {
        if (!('username' in req.body) || !('password' in req.body))
        {
            res.status(404).send("Incorrect customer data.");
            return
        }
        let salt = crypto.randomBytes(32).toString('hex')
        let password = pbkdf2.pbkdf2Sync(req.body.password, salt, 1, 32, 'sha512').toString('hex')
        let add = new User({
            username: req.body.username,
            password: password,
            salt: salt
        })
        add.save().then(() => {
            res.status(200).send('Success')
        })
});

// update a user by id
userRoutes.put('/users/:id',
    checkAuth, 
    async function (req, res) {
    try {
        const id = req.params.id
        if (!('username' in req.body) || !('password' in req.body))
        {
            res.status(404).send("Incorrect customer data.");
            return
        }
        const user = await User.findById(id)
        if (!user) {
            res.status(404).send("User not found.");
            return;
        }
        let salt = crypto.randomBytes(32).toString('hex')
        let password = pbkdf2.pbkdf2Sync(req.body.password, salt, 1, 32, 'sha512').toString('hex')
        user.username = req.body.username
        user.salt = salt
        user.password = password
        console.log(user)
        User.findByIdAndUpdate(id, user).then(() => {
            res.status(200).send('Success')
        })
    } catch (e) {
        res.status(500).send(`Error updating customer: ${e}`)
    }
});

// partial update a user by id
userRoutes.patch('/users/:id',
    checkAuth, 
    async function (req, res) {
    try {
        const id = req.params.id
        if (!('username' in req.body))
        {
            res.status(404).send("Incorrect customer data.");
            return
        }
        const user = await User.findById(id)
        if (!user) {
            res.status(404).send("User not found.");
            return;
        }
        user.username = req.body.username
        User.findByIdAndUpdate(id, user).then(() => {
            res.status(200).send('Success')
        })
    } catch (e) {
        res.status(500).send(`Error updating customer: ${e}`)
    }
});

// delete user
userRoutes.delete('/users/:id',
    checkAuth, 
    async function(req, res) {
        try {
            const id = req.params.id
            await User.findByIdAndDelete(id)
            res.status(200).send('Success')
        } catch (err) {
            res.status(500).send(`Error deleting user ${err}`)
        }
        
});

module.exports = {userRoutes, User}