/*
Currently when the email is sent for data update, then token provided is valid for X minutes
this means the user can click on that token any number of times in those X minutes to update their data
I don't like this, so the idea is to store the generated tokens in their seperate database
and nullify a token (by removing it from the db) as soon as that update profile button is clicked.

But just for the sake of simplicity and reducing the data stored on the system, I'm solely dealing with 
stateless jwt tokens at the moment.
*/

// const mongoose = require('mongoose');
// const crypto = require('crypto');
// const { BadRequestError } = require('../errors');


// const TokenSchema = new mongoose.Schema({
//     token : {
//         type: String,
//         required: true,
//         unique: true
//     },
//     expiry: { 
//         type: Date, 
//         required: true 
//     },
//     userId: {
//         type: mongoose.Schema.Types.ObjectId, 
//         ref: 'User-db-2', 
//         required: true 
//     }
// });


// TokenSchema.statics.createToken = async function(userId) {
//     const tokenValue = crypto.randomBytes(32).toString('hex');
//     const expiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

//     const token = new this({
//         token: tokenValue,
//         expiry: expiry,
//         userId: userId
//     });

//     await token.save();
//     return tokenValue;
// };

// UserSchema.methods.comparePassword = async function (canditatePassword) {
//     const isMatch = await bcrypt.compare(canditatePassword, this.password)
//     return isMatch
// };

// module.exports = mongoose.model('User-db-2', UserSchema);