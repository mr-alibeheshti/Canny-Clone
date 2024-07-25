// Submit Vote -> successful , Unsuccessful(Not Verify,Duplicate Vote)
// add TEST IN FILE NAME

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../app");
const User = require("../models/UserModel");
const Feedback = require("../models/FeedbackModel");
jest.mock("../utils/smtp", () => ({
	sendEmail: jest.fn().mockResolvedValue("Email sent successfully"),
	configEmailService: jest.fn().mockResolvedValue("Email service configured"),
}));

let mongoServer;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();

	await mongoose.connect(uri, {});
	const user = await User.create({
		name: "ali",
		email: "abeheshti127@gmail.com",
		password: "12345678",
		passwordConfirm: "12345678",
	});
	await Feedback.create({
		title: "title",
		body: "body",
		user: user._id,
	});
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoServer.stop();
});

// Tests
describe("Submit Vote", () => {
	it("enter *Valid Vote* and Status is *successful*", async () => {
		const userObj = {
			email: "abeheshti127@gmail.com",
			password: "12345678",
		};
		await request(app).post("/api/v1/user/login").send(userObj);
		const feedback = await Feedback.findOne();
		const user = await User.findOne({ email: "abeheshti127@gmail.com" });
		const res = await request(app)
			.post(`/api/v1/vote/${feedback._id}`)
			.set("Authorization", `Bearer ${user.verifyToken}`);
		expect(res.statusCode).toBe(201);
	});

	it("enter *Duplicate Vote* and Status is *Unsuccessful*", async () => {
		const userObj = {
			email: "abeheshti127@gmail.com",
			password: "12345678",
		};
		await request(app).post("/api/v1/user/login").send(userObj);
		const feedback = await Feedback.findOne();
		const user = await User.findOne({ email: "abeheshti127@gmail.com" });
		const res = await request(app)
			.post(`/api/v1/vote/${feedback._id}`)
			.set("Authorization", `Bearer ${user.verifyToken}`);
		expect(res.statusCode).toBe(400);
	});

	it("enter *Not Verify* and Status is *Unsuccessful*", async () => {
		const feedback = await Feedback.findOne();
		const res = await request(app)
			.post(`/api/v1/vote/${feedback._id}`)
			.set("Authorization", `Bearer InvalidTOKEN`);
		expect(res.statusCode).toBe(404);
	});
});
