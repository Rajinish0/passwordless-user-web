const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { hashPass } = require('../utils');
const { BadRequestError } = require('../errors');


const UserSchema = new mongoose.Schema({
    firstName : {
        type: String,
        required: [true, "Please provide first name"],
        maxlength: 50,
        minlength: 3 
    },

    lastName : {
        type: String,
        // required: [true, "Please provide last name"],
        maxlength: 50,
        minlength: 3
    },

    email: {
        type: String, 
        required : [true, "Please provide email"],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
          ],
        unique: [true, "This email already exists"],
        maxlength: 100
    },

    batch : {
        type: Number,
        required: [true, "Please provide batch number"],
        min: 1960
    },

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
    },

    facebook: {
        type: String,
        match: [/^(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?$/,
                "Please provide a valid facebook url"
        ],
        required: false,
        default: "",
        maxlength: 100
      },

    instagram: {
        type: String,
        match: [/^(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\/[A-Za-z0-9_.-]+\/?$/,
                "Please provide a valid instagram link"
        ],
        required: false,
        default: "",
        maxlength: 100
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