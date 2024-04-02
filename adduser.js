const crypto = require('crypto')
const mongoose = require('mongoose')
const pbkdf2 = require('pbkdf2')
const { Schema } = mongoose

const url = 'mongodb+srv://bealssa:Porpoise08@samcluster.atipphu.mongodb.net/radiohead?retryWrites=true&w=majority'
try {
    mongoose.connect(url)
} catch(e) {
    console.log(e)
}

const userSchema = new Schema({
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

const clearText = 'openSesame'
let salt = crypto.randomBytes(32).toString('hex')
let password = pbkdf2.pbkdf2Sync(clearText, salt, 1, 32, 'sha512').toString('hex')
let add = new User({
    username: 'bob',
    password: password,
    salt: salt
})

add.save();