const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

function configEmailService() {
	const MAIL_HOST = "smtp.c1.liara.email";
	const MAIL_PORT = 587;
	const MAIL_USER = "dazzling_dhawan_tf74ds";
	const MAIL_PASSWORD = "1cc6e828-d73b-42cf-9b1b-2da0b7adcd00";

	if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASSWORD) {
		throw new Error("One or more mail environment variables are missing.");
	}

	const transporter = nodemailer.createTransport({
		host: MAIL_HOST,
		port: MAIL_PORT,
		secure: false, // Use true for port 465, false for other ports
		auth: {
			user: MAIL_USER,
			pass: MAIL_PASSWORD,
		},
		tls: {
			rejectUnauthorized: false,
		},
	});

	return transporter;
}

function sendEmail(email, subject, text) {
	const transporter = configEmailService();

	transporter
		.sendMail({
			from: `"Canny" <info@teenagedream.ir>`,
			to: email,
			subject: subject,
			text: text,
		})
		.then(() => console.log("OK, Email has been sent."))
		.catch((error) => console.error("Error sending email:", error));
}

module.exports = { sendEmail, configEmailService };
