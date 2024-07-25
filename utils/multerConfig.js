const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs")
const storage = multer.memoryStorage();

const upload = multer({ storage });

const resizeRequestImages = async (req, res, next) => {
	if (!fs.existsSync('uploads')) {
		fs.mkdirSync('uploads');
	}
	if (!req.files || !req.files.images) return next();

	req.body.images = [];
	await Promise.all(
		req.files.images.map(async (file, index) => {
			const filename = `request-${req.body.title}-${Date.now()}-${index + 1}.jpeg`;
			await sharp(file.buffer)
				.resize(2000, 1333)
				.toFormat("jpeg")
				.jpeg({ quality: 90 })
				.toFile(`uploads/${filename}`);
			req.body.images.push(filename);
		}),
	);

	next();
};

module.exports = {
	uploadRequestImages: upload.fields([{ name: "images", maxCount: 10 }]),
	resizeRequestImages,
};
