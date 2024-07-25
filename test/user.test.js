// login Test -> Valid data , InValid data
// signUp Test -> Valid data , InValid data(duplicate User + InValid Data)
// delete Test -> successful , UnSuccessful(Not Verify,No Account)
// resetPass Test -> successful,UnSuccessful(Not Verify,Not Correct Now password,Not Correct Coniform password)
// forgetPass Test -> validEmail(SendEmail,Unsend Email),InvalidEmail

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../app");
const User = require("../models/UserModel");
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

describe("signUp", () => {
	it("enter *Valid* Data and Status is *successful*", async () => {
		const userObj = {
			name: "ali",
			email: "abeheshti1217@gmail.com",
			password: "12345678",
			passwordConfirm: "12345678",
		};
		const res = await request(app).post("/api/v1/user/signup").send(userObj);
		expect(res.statusCode).toBe(201);
	});
	it("enter *Duplicate* Data and Status is *Unsuccessful*", async () => {
		const userObj = {
			name: "ali",
			email: "abeheshti1217@gmail.com",
			password: "12345678",
			passwordConfirm: "12345678",
		};
		const res = await request(app).post("/api/v1/user/signup").send(userObj);
		expect(res.statusCode).toBe(409);
	});
	it("enter *InValid* Data and Status is *Unsuccessful*", async () => {
		const userObj = {
			name: "ali",
			password: "12345678",
			passwordConfirm: "12345678",
		};
		const res = await request(app).post("/api/v1/user/signup").send(userObj);
		expect(res.statusCode).toBe(400);
	});
});

describe("Login", () => {
	it("enter *Valid* Data and Status is *successful*", async () => {
		const userObj = {
			email: "abeheshti127@gmail.com",
			password: "12345678",
		};
		const res = await request(app).post("/api/v1/user/login").send(userObj);
		expect(res.statusCode).toBe(200);
	});

	it("enter *InValid* Data and Status is *Unsuccessful*", async () => {
		const userObj = {
			email: "test@gmail.com",
			password: "12345678",
		};
		const res = await request(app).post("/api/v1/user/login").send(userObj);
		expect(res.statusCode).toBe(401);
	});
});

describe("ResetPassword", () => {
	it("enter *InValid Email* Data and Status is *Unsuccessful*", async () => {
		const user = await User.findOne({ email: "abeheshti127@gmail.com" });

		const data = {
			email: "Invalid@gmail.com",
			currentPassword: "12345678",
			newPassword: "123456789",
			newPasswordConfirm: "123456789",
		};
		const res = await request(app)
			.post("/api/v1/user/password_reset")
			.set("Authorization", `Bearer ${user.verifyToken}`)
			.send(data);
		expect(res.statusCode).toBe(404);
	});
	it("enter *InValid Password* Data and Status is *Unsuccessful*", async () => {
		const user = await User.findOne({ email: "abeheshti127@gmail.com" });

		const data = {
			email: "abeheshti127@gmail.com",
			currentPassword: "InValid Password",
			newPassword: "123456789",
			newPasswordConfirm: "123456789",
		};
		const res = await request(app)
			.post("/api/v1/user/password_reset")
			.set("Authorization", `Bearer ${user.verifyToken}`)
			.send(data);
		expect(res.statusCode).toBe(401);
	});
	it("enter *Valid* Data and Status is *successful*", async () => {
		const user = await User.findOne({ email: "abeheshti127@gmail.com" });
		const data = {
			email: "abeheshti127@gmail.com",
			currentPassword: "12345678",
			newPassword: "123456789",
			newPasswordConfirm: "123456789",
		};
		const res = await request(app)
			.post("/api/v1/user/password_reset")
			.set("Authorization", `Bearer ${user.verifyToken}`)
			.send(data);
		expect(res.statusCode).toBe(200);
	});
	it("enter *InValid Token* Data and Status is *Unsuccessful*", async () => {
		const data = {
			email: "abeheshti127@gmail.com",
			currentPassword: "12345678",
			newPassword: "123456789",
			newPasswordConfirm: "123456789",
		};
		const res = await request(app)
			.post("/api/v1/user/password_reset")
			.set("Authorization", `Bearer invalidToken`)
			.send(data);
		expect(res.statusCode).toBe(400);
	});
});
describe("ForgetPassword", () => {
	it("enter *InValid Email* Data and Status is *Unsuccessful*", async () => {
		const email = { email: "InVaildEmail@gmail.com" };
		const res = await request(app)
			.post("/api/v1/user/forget_password")
			.send(email);
		expect(res.statusCode).toBe(404);
	});
	it("enter *Valid Email* Data and Status is *successful*", async () => {
		const email = {
			email: "abeheshti127@gmail.com",
		};
		const res = await request(app)
			.post("/api/v1/user/forget_password")
			.send(email);
		expect(res.statusCode).toBe(200);
	});
});

describe("DeleteMe", () => {
	it("enter *Valid* Data and Status is *successful*", async () => {
		const user = await User.findOne({ email: "abeheshti127@gmail.com" });
		const res = await request(app)
			.delete("/api/v1/user/deleteMe")
			.set("Authorization", `Bearer ${user.verifyToken}`);

		expect(res.statusCode).toBe(202);
	});
	it("enter *InValid* Data and Status is *Unsuccessful*", async () => {
		const res = await request(app)
			.delete("/api/v1/user/deleteMe")
			.set("Authorization", `Bearer NotVaild`);
		expect(res.statusCode).toBe(400);
	});
});
