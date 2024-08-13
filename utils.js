const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const { BadRequestError } = require('./errors');

const hashPass = async function(password){
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

const validateImage = function(image){
    if (!image) return;

    if (image.mimetype.split('/')[0] != 'image')
        throw new BadRequestError("File mimetype must be image");

    const ext = path.extname(image.name);
    const re = /\.(jpg|jpeg|png)$/;
    if (!ext.match(re)) 
        throw new BadRequestError("Invalid image extension");
}

const processReqWithPhoto = async function(req, id){
    const image = req.files.photo;
    const finalPath = path.join(path.dirname('..'), 'uploads', `${id}.png` );
    validateImage(image);
    /* 
    passing the file directly to sharp was locking it for some reason
    which caused problems while deleting the tmp file (although it should not have)
    TO DO: i need to debug why that was happening.
    */
    const fileBuffer = await fs.readFile(image.tempFilePath);
    await sharp(fileBuffer)
            .png()
            .resize(400, 400)
            .toFile(finalPath);
    return finalPath;
}
/*
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


if in future i decide to upload the images to a cloud
multer can be configured to do that so only 
the above config would need to be changed.




const upload = multer( {
    storage: storage,
    limits,
    fileFilter } );
*/


module.exports = {
    hashPass,
    validateImage,
    processReqWithPhoto
}