import { AuthModel } from "../auth_models";
import { pool } from "../../db";

const PHONE = "9876543210";
const PHONE2 = "9123456780";

beforeEach(async () => {
    await pool.query("DELETE FROM otps");
    await pool.query("DELETE FROM users");
});

afterAll(async () => {
    await pool.end();
});


describe("saveOtp", () => {
    it("saves and returns the row — phone and otp match, id exists", async () => {
        const row = await AuthModel.saveOtp(PHONE, "123456");

        expect(row.phone).toBe(PHONE);
        expect(row.otp).toBe("123456");
        expect(row.id).toBeDefined();
    });

    it("sets expiry to ~5 minutes from now", async () => {
        const before = Date.now();
        const row = await AuthModel.saveOtp(PHONE, "123456");
        const expires = new Date(row.expires_at).getTime();

        expect(expires).toBeGreaterThan(before + 4 * 60 * 1000);
        expect(expires).toBeLessThan(Date.now() + 6 * 60 * 1000);
    });

    it("replaces old OTP for the same phone", async () => {
        await AuthModel.saveOtp(PHONE, "111111");
        await AuthModel.saveOtp(PHONE, "222222");

        expect(await AuthModel.verifyOtp(PHONE, "111111")).toBe(false);
        expect(await AuthModel.verifyOtp(PHONE, "222222")).toBe(true);
    });

    it("does not delete OTP of another phone", async () => {
        await AuthModel.saveOtp(PHONE, "123456");
        await AuthModel.saveOtp(PHONE2, "654321");

        expect(await AuthModel.verifyOtp(PHONE, "123456")).toBe(true);
        expect(await AuthModel.verifyOtp(PHONE2, "654321")).toBe(true);
    });
});


describe("verifyOtp", () => {
    it("returns true for a correct, unexpired OTP", async () => {
        await AuthModel.saveOtp(PHONE, "123456");

        expect(await AuthModel.verifyOtp(PHONE, "123456")).toBe(true);
    });

    it("returns false for a wrong OTP", async () => {
        await AuthModel.saveOtp(PHONE, "123456");

        expect(await AuthModel.verifyOtp(PHONE, "000000")).toBe(false);
    });

    it("returns false for an expired OTP", async () => {
        await pool.query(
            `INSERT INTO otps (phone, otp, expires_at)
       VALUES ($1, $2, NOW() - INTERVAL '1 minute')`,
            [PHONE, "123456"]
        );

        expect(await AuthModel.verifyOtp(PHONE, "123456")).toBe(false);
    });

    it("returns false if no OTP was ever requested", async () => {
        expect(await AuthModel.verifyOtp(PHONE, "123456")).toBe(false);
    });

    it("is one-time use — same OTP fails the second time", async () => {
        await AuthModel.saveOtp(PHONE, "123456");

        expect(await AuthModel.verifyOtp(PHONE, "123456")).toBe(true);
        expect(await AuthModel.verifyOtp(PHONE, "123456")).toBe(false);
    });

    it("failed attempt does not burn the correct OTP", async () => {
        await AuthModel.saveOtp(PHONE, "123456");

        expect(await AuthModel.verifyOtp(PHONE, "000000")).toBe(false);
        expect(await AuthModel.verifyOtp(PHONE, "123456")).toBe(true);
    });
});


describe("findOrCreateUser", () => {
    it("creates a new user if none exists", async () => {
        const user = await AuthModel.findOrCreateUser(PHONE);

        expect(user.phone).toBe(PHONE);
        expect(user.id).toBeDefined();
    });

    it("returns existing user instead of creating a duplicate", async () => {
        const first = await AuthModel.findOrCreateUser(PHONE);
        const second = await AuthModel.findOrCreateUser(PHONE);

        expect(second.id).toBe(first.id);

        const res = await pool.query(
            "SELECT COUNT(*) FROM users WHERE phone = $1",
            [PHONE]
        );
        expect(Number(res.rows[0].count)).toBe(1);
    });

    it("creates different users for different phones", async () => {
        const user1 = await AuthModel.findOrCreateUser(PHONE);
        const user2 = await AuthModel.findOrCreateUser(PHONE2);

        expect(user1.id).not.toBe(user2.id);
        expect(user2.phone).toBe(PHONE2);
    });
});
