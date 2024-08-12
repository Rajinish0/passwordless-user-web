const bcrypt = require('bcryptjs');
const multer = require('multer');

const hashPass = async function(password){
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

const storage = multer.diskStorage({
    desination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
})

const limits = {
    fileSize: proces.env.MAX_IMG_SIZE ? parseInt(process.env.MAX_IMG_SIZE, 10) : 5 * 1024 * 1024
};


const fileFilter = (req, file, cb) => {
    if (!file.originalname.match('/\.(jpg|jpeg|png)$/')){
        return cb(new BadRequestError('Only JPG, JPEG, and PNG images are allowed'));
    }
    cb(null, true);
}

/*
if in future i decide to upload the images to a cloud
multer can be configured to do that so only 
the above config would need to be changed.
*/

const upload = multer( {
    storage: storage,
    limits,
    fileFilter } );

module.exports = {
    hashPass,
    upload
}