const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { hashPass } = require('../utils');
const { BadRequestError } = require('../errors');


const UserSchema = new mongoose.Schema({
    firstName : {
        type: String,
        required: [true, "Please provide firstName"],
        maxlength: 50,
        minlength: 3 
    },

    // lastName : {
    //     type: String,
    //     required: [true, "Please provide lastName"],
    //     maxlength: 50,
    //     minlength: 3
    // },

    email: {
        type: String, 
        required : [true, "Please provide email"],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
          ],
        unique: [true, "This email already exists"]
    },

    batch : {
        type: Number,
        required: [true, "Please provide batch number"],
        min: 1960
    },

    // phoneNum : {
    //     type: String,
    //     required: false, 
    //     match: [
    //         /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    //         "Please provide a valid number"
    //     ]
    // },

    imagePath : {
        type: String,
        required: false,
        default: "uploads/default-image.jpg"
    },

    activated : {
        type: Boolean,
        required: false,
        default: false
    },

    lastVerifyRequest : {
        type: Date,
        default: Date.now
    },

    phoneNum : {
        type : String, 
        default : "",
        required: false,
        match : [/^(?:\+92|92)?\s?(\d{3})[\s.-]?(\d{7})$|^(?:\+92|92)?\s?\((\d{3})\)[\s.-]?(\d{7})$/, 
                "Please provide a valid phone number"]
    }
}, {
    timestamps: true
});


UserSchema.methods.createJWT = function (time, secret) {
    return jwt.sign(
        {userId : this._id, userEmail : this.email },
        secret || process.env.JWT_SECRET,
        {
            expiresIn: time || process.env.JWT_LIFETIME
        }
    );
};

UserSchema.methods.comparePassword = async function (canditatePassword) {
    const isMatch = await bcrypt.compare(canditatePassword, this.password)
    return isMatch
};

module.exports = mongoose.model('User-db-2', UserSchema);