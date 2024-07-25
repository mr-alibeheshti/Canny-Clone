const mongoose = require("mongoose");
const app = require("./app");

mongoose
	.connect("mongodb://localhost:27017/canny", {})
	.then(() => console.log("Connected to the database."))
	.catch((err) => {
		console.error("Database connection error:", err);
		process.exit(1);
	});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);
	server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
	console.error("Uncaught Exception:", err);
	server.close(() => process.exit(1));
});

const server = app.listen(8000, () => {
	console.log(`App is running on port ${8000}.`);
});
