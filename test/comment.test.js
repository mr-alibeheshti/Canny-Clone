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
describe("Submit Comment", () => {
	it("enter *Valid data BUT no Verify* and Status is *Unsuccessful*", async () => {
		const Data = {
			title: "title for comment",
			body: "body for comment",
			images: "test.jpg",
		};

		const feedback = await Feedback.findOne();

		const res = await request(app)
			.post(`/api/v1/comment/${feedback._id}`)
			.set("Authorization", `Bearer InvalidTOKEN`)
			.send(Data);
		expect(res.statusCode).toBe(404);
	});

	it("enter *Valid Data* and Status is *successful*", async () => {
		const Data = {
			title: "title for comment",
			body: "body for comment",
		};
		const userObj = {
			email: "abeheshti127@gmail.com",
			password: "12345678",
		};
		const feedback = await Feedback.findOne();
		await request(app).post("/api/v1/user/login").send(userObj);
		const user = await User.findOne({ email: "abeheshti127@gmail.com" });
		const res = await request(app)
			.post(`/api/v1/comment/${feedback._id}`)
			.set("Authorization", `Bearer ${user.verifyToken}`)
			.send(Data);
		expect(res.statusCode).toBe(201);
	});

	it("enter *InValid Data* and Status is *Unsuccessful*", async () => {
		const Data = {
			INvalid: "INvalid",
		};
		const feedback = await Feedback.findOne();

		const user = await User.findOne({ email: "abeheshti127@gmail.com" });
		const res = await request(app)
			.post(`/api/v1/comment/${feedback._id}`)
			.set("Authorization", `Bearer ${user.verifyToken}`)
			.send(Data);
		expect(res.statusCode).toBe(400);
	});

	it("enter *Duplicate data* and Status is *Unsuccessful*", async () => {
		const Data = {
			title: "title for comment",
			body: "body for comment",
		};
		const feedback = await Feedback.findOne();
		const userObj = {
			email: "abeheshti127@gmail.com",
			password: "12345678",
		};
		await request(app).post("/api/v1/user/login").send(userObj);
		const user = await User.findOne({ email: "abeheshti127@gmail.com" });
		await request(app)
			.post(`/api/v1/comment/${feedback._id}`)
			.set("Authorization", `Bearer ${user.verifyToken}`)
			.send(Data);
		const res = await request(app)
			.post(`/api/v1/comment/${feedback._id}`)
			.set("Authorization", `Bearer ${user.verifyToken}`)
			.send(Data);
		expect(res.statusCode).toBe(500);
	});

	it("enter *Not Found Feedback* and Status is *Unsuccessful*", async () => {
		const Data = {
			title: "title for comment",
			body: "body for comment",
		};
		const feedback = await Feedback.findOne();

		const userObj = {
			email: "abeheshti127@gmail.com",
			password: "12345678",
		};
		await request(app).post("/api/v1/user/login").send(userObj);
		const user = await User.findOne({ email: "abeheshti127@gmail.com" });
		const res = await request(app)
			.post(`/api/v1/comment/invaild`)
			.set("Authorization", `Bearer ${user.verifyToken}`)
			.send(Data);
		expect(res.statusCode).toBe(500);
	});
});
