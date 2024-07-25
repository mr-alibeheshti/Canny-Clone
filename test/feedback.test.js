// Submit feedback -> successful , Unsuccessful(Not Verify,Duplicate Feedback,Invalid Data)
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../app");
const User = require("../models/UserModel");
const { title } = require("process");
jest.mock("../utils/smtp", () => ({
	sendEmail: jest.fn().mockResolvedValue("Email sent successfully"),
	configEmailService: jest.fn().mockResolvedValue("Email service configured"),
}));

let mongoServer;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();

	await mongoose.connect(uri, {});
	await User.create({
		name: "ali",
		email: "abeheshti127@gmail.com",
		password: "12345678",
		passwordConfirm: "12345678",
	});
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoServer.stop();
});
// Tests
describe("Submit Feedback", () => {
	it("enter *Valid data BUT no Verify* and Status is *Unsuccessful*", async () => {
		const Data = {
			title: "title for Feedback",
			body: "body for Feedback",
			images: "test.jpg",
		};
		const res = await request(app)
			.post("/api/v1/feedback/")
			.set("Authorization", `Bearer InvalidTOKEN`)
			.send(Data);
		expect(res.statusCode).toBe(400);
	});
	it("enter *Valid Data* and Status is *successful*", async () => {
		const Data = {
			title: "title for Feedback",
			body: "body for Feedback",
		};
		const userObj = {
			email: "abeheshti127@gmail.com",
			password: "12345678",
		};
		await request(app).post("/api/v1/user/login").send(userObj);
		const user = await User.findOne({ email: "abeheshti127@gmail.com" });
		const res = await request(app)
			.post("/api/v1/feedback/")
			.set("Authorization", `Bearer ${user.verifyToken}`)
			.send(Data);
		expect(res.statusCode).toBe(201);
	});
	it("enter *InValid Data* and Status is *Unsuccessful*", async () => {
		const Data = {
			INvalid: "INvalid",
		};
		const user = await User.findOne({ email: "abeheshti127@gmail.com" });
		const res = await request(app)
			.post("/api/v1/feedback/")
			.set("Authorization", `Bearer ${user.verifyToken}`)
			.send(Data);
		expect(res.statusCode).toBe(400);
	});
	it("enter *Duplicate data* and Status is *Unsuccessful*", async () => {
		const Data = {
			title: "title for Feedback",
			body: "body for Feedback",
			images: "test.jpg",
		};
		const userObj = {
			email: "abeheshti127@gmail.com",
			password: "12345678",
		};
		await request(app).post("/api/v1/user/login").send(userObj);
		const user = await User.findOne({ email: "abeheshti127@gmail.com" });
		const res = await request(app)
			.post("/api/v1/feedback/")
			.set("Authorization", `Bearer ${user.verifyToken}`)
			.send(Data);
		expect(res.statusCode).toBe(400);
	});
});
