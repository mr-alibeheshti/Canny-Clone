const pino = require("pino");
const fs = require("node:fs");
const path = require("node:path");

const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir);
}
const LogFile = path.join(logDir, "app.log");

const stream = pino.destination(LogFile);

const logger = pino(stream);
module.exports = logger;
