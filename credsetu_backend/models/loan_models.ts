import { pool } from '../db';

export interface LoanRecord {
  id: number;
  user_phone: string;
  friend_name: string;
  amount: number;
  due_date: string;
  repaid: boolean;
  receipt_url?: string | null;
  created_at: string;
}

export interface SummaryResult {
  totalLent: number;
  totalRepaid: number;
  overdueAmount: number;
  outstanding: number;
}

export interface ReceiptRecord {
  id: number;
  user_phone: string;
  filename: string | null;
  mime_type: string;
  data: Buffer;
  created_at: string;
}

export const LoanModel = {
  async saveReceipt(data: {
    userPhone: string;
    filename?: string;
    mimeType: string;
    data: Buffer;
  }): Promise<number> {
    const res = await pool.query(
      `INSERT INTO receipts (user_phone, filename, mime_type, data)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [data.userPhone, data.filename || null, data.mimeType, data.data]
    );
    return res.rows[0].id;
  },

  async getReceiptById(id: number): Promise<ReceiptRecord | null> {
    const res = await pool.query(
      `SELECT id, user_phone, filename, mime_type, data, created_at
       FROM receipts
       WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  async createLoan(data: {
    userPhone: string;
    friendName: string;
    amount: number;
    dueDate: string;
    receiptUrl?: string | null;
  }): Promise<LoanRecord> {
    const res = await pool.query(
      `INSERT INTO loans (user_phone, friend_name, amount, due_date, repaid, receipt_url)
       VALUES ($1, $2, $3, $4, FALSE, $5)
       RETURNING id, user_phone, friend_name, amount::float, TO_CHAR(due_date, 'YYYY-MM-DD') as due_date, repaid, receipt_url, created_at`,
      [data.userPhone, data.friendName, data.amount, data.dueDate, data.receiptUrl || null]
    );
    return res.rows[0];
  },

  async getLoansByUser(userPhone: string): Promise<LoanRecord[]> {
    const res = await pool.query(
      `SELECT id, user_phone, friend_name, amount::float, TO_CHAR(due_date, 'YYYY-MM-DD') as due_date, repaid, receipt_url, created_at
       FROM loans
       WHERE user_phone = $1
       ORDER BY created_at DESC`,
      [userPhone]
    );
    return res.rows;
  },

  async markAsRepaid(id: number, userPhone: string): Promise<LoanRecord | null> {
    const res = await pool.query(
      `UPDATE loans
       SET repaid = TRUE
       WHERE id = $1 AND user_phone = $2
       RETURNING id, user_phone, friend_name, amount::float, TO_CHAR(due_date, 'YYYY-MM-DD') as due_date, repaid, receipt_url, created_at`,
      [id, userPhone]
    );
    return res.rows[0] || null;
  },

  async getSummary(userPhone: string): Promise<SummaryResult> {
    const query = `
      SELECT
        COALESCE(SUM(amount), 0)::float as "totalLent",
        COALESCE(SUM(CASE WHEN repaid = TRUE THEN amount ELSE 0 END), 0)::float as "totalRepaid",
        COALESCE(SUM(CASE WHEN repaid = FALSE AND due_date < CURRENT_DATE THEN amount ELSE 0 END), 0)::float as "overdueAmount"
      FROM loans
      WHERE user_phone = $1;
    `;
    const res = await pool.query(query, [userPhone]);
    const row = res.rows[0] || { totalLent: 0, totalRepaid: 0, overdueAmount: 0 };
    const totalLent = Number(row.totalLent) || 0;
    const totalRepaid = Number(row.totalRepaid) || 0;
    const overdueAmount = Number(row.overdueAmount) || 0;

    return {
      totalLent,
      totalRepaid,
      overdueAmount,
      outstanding: totalLent - totalRepaid,
    };
  }
};
