import { LoanModel } from "../loan_models";
import { pool } from "../../db";

const PHONE = "9876543210";
const PHONE2 = "9123456780";

beforeEach(async () => {
    await pool.query("DELETE FROM loans");
    await pool.query("DELETE FROM receipts");
});

afterAll(async () => {
    await pool.end();
});

// small helper so I don't repeat createLoan everywhere
async function addLoan(userPhone = PHONE, data: any = {}) {
    return LoanModel.createLoan({
        userPhone,
        friendName: "Rahul",
        amount: 1000,
        dueDate: "2099-01-01",
        ...data,
    });
}

describe("saveReceipt / getReceiptById", () => {
    it("saves a receipt and can fetch it back", async () => {
        const id = await LoanModel.saveReceipt({
            userPhone: PHONE,
            filename: "receipt.jpg",
            mimeType: "image/jpeg",
            data: Buffer.from("hello receipt"),
        });

        expect(id).toBeDefined();

        const receipt = await LoanModel.getReceiptById(id);
        expect(receipt?.filename).toBe("receipt.jpg");
        expect(receipt?.mime_type).toBe("image/jpeg");
        expect(receipt?.data.toString()).toBe("hello receipt");
    });

    it("saves filename as null if not given", async () => {
        const id = await LoanModel.saveReceipt({
            userPhone: PHONE,
            mimeType: "image/png",
            data: Buffer.from("x"),
        });

        const receipt = await LoanModel.getReceiptById(id);
        expect(receipt?.filename).toBeNull();
    });

    it("returns null for a receipt that does not exist", async () => {
        expect(await LoanModel.getReceiptById(999999)).toBeNull();
    });
});

describe("createLoan", () => {
    it("creates a loan, unpaid by default", async () => {
        const loan = await addLoan(PHONE, {
            friendName: "Priya",
            amount: 750.5,
            dueDate: "2026-12-01",
        });

        expect(loan.friend_name).toBe("Priya");
        expect(loan.amount).toBe(750.5);
        expect(loan.due_date).toBe("2026-12-01");
        expect(loan.repaid).toBe(false);
        expect(loan.receipt_url).toBeNull();
    });

    it("stores receipt url when given", async () => {
        const loan = await addLoan(PHONE, { receiptUrl: "/receipts/1" });
        expect(loan.receipt_url).toBe("/receipts/1");
    });
});

describe("getLoansByUser", () => {
    it("returns only that user's loans", async () => {
        await addLoan(PHONE);
        await addLoan(PHONE);
        await addLoan(PHONE2);

        const loans = await LoanModel.getLoansByUser(PHONE);
        expect(loans.length).toBe(2);
        expect(loans[0].user_phone).toBe(PHONE);
    });

    it("returns empty array if user has no loans", async () => {
        expect(await LoanModel.getLoansByUser(PHONE)).toEqual([]);
    });

    it("gives newest loan first", async () => {
        await addLoan(PHONE, { friendName: "First" });
        await addLoan(PHONE, { friendName: "Second" });

        const loans = await LoanModel.getLoansByUser(PHONE);
        expect(loans[0].friend_name).toBe("Second");
        expect(loans[1].friend_name).toBe("First");
    });
});

describe("markAsRepaid", () => {
    it("marks a loan as repaid", async () => {
        const loan = await addLoan(PHONE);

        const updated = await LoanModel.markAsRepaid(loan.id, PHONE);
        expect(updated?.repaid).toBe(true);
    });

    it("returns null for an id that does not exist", async () => {
        expect(await LoanModel.markAsRepaid(999999, PHONE)).toBeNull();
    });

    it("can't mark someone else's loan as repaid", async () => {
        const loan = await addLoan(PHONE);

        const result = await LoanModel.markAsRepaid(loan.id, PHONE2);
        expect(result).toBeNull();

        const loans = await LoanModel.getLoansByUser(PHONE);
        expect(loans[0].repaid).toBe(false);
    });
});

describe("getSummary", () => {
    it("gives all zeros for a new user", async () => {
        expect(await LoanModel.getSummary(PHONE)).toEqual({
            totalLent: 0, totalRepaid: 0, overdueAmount: 0, outstanding: 0,
        });
    });

    it("calculates summary correctly", async () => {
        await addLoan(PHONE, { amount: 500, dueDate: "2020-01-01" });  // overdue
        await addLoan(PHONE, { amount: 1200, dueDate: "2099-01-01" }); // pending
        const repaidLoan = await addLoan(PHONE, { amount: 300, dueDate: "2020-01-01" });
        await LoanModel.markAsRepaid(repaidLoan.id, PHONE);            // repaid, so NOT overdue

        expect(await LoanModel.getSummary(PHONE)).toEqual({
            totalLent: 2000, totalRepaid: 300, overdueAmount: 500, outstanding: 1700,
        });
    });

    it("summary only counts that user's loans", async () => {
        await addLoan(PHONE, { amount: 500 });
        await addLoan(PHONE2, { amount: 5000 });

        const summary = await LoanModel.getSummary(PHONE);
        expect(summary.totalLent).toBe(500);
    });
});
