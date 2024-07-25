require("express-async-errors");
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const RateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const logger = require("./utils/logger");
const AppError = require("./utils/AppError");
const pinoHttp = require("pino-http");
const handleError = require("./utils/errorHandler");

const app = express();
app.use(pinoHttp({ logger }));
app.use(express.json());
// Increase Security & Speed
app.use(helmet());
app.use(compression());
app.use(hpp());
app.use(mongoSanitize());
app.use(xss());

const limiter = RateLimit({
	windowMs: 60 * 60 * 1000,
	max: 100,
	message: "Too many requests from your IP, please try again later.",
});
app.use("/api", limiter);

// Routers V1
app.use("/api/v1/user", require("./routes/V1/userRoutes"));
app.use("/api/v1/feedback", require("./routes/V1/feedbackRoutes"));
app.use("/api/v1/comment", require("./routes/V1/commentRoutes"));
app.use("/api/v1/vote", require("./routes/V1/VoteRouters"));
app.use("/api/v2/user", require("./routes/V2/userRoutes"));
// Error Handler
app.all("*", (req, res, next) => {
	next(new AppError(`Not found: ${req.originalUrl}`, 404));
});

app.use(handleError);

module.exports = app;
