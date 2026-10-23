import { pool } from '../db';

export interface User {
  id: number;
  phone: string;
  created_at: Date;
}

export interface OtpRecord {
  id: number;
  phone: string;
  otp: string;
  created_at: Date;
  expires_at: Date;
}

export const AuthModel = {
  async saveOtp(phone: string, otp: string): Promise<OtpRecord> {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    await pool.query('DELETE FROM otps WHERE phone = $1', [phone]);
    const res = await pool.query(
      `INSERT INTO otps (phone, otp, expires_at) VALUES ($1, $2, $3) RETURNING *`,
      [phone, otp, expiresAt]
    );
    return res.rows[0];
  },

  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const res = await pool.query(
      `SELECT * FROM otps WHERE phone = $1 AND otp = $2 AND expires_at > CURRENT_TIMESTAMP ORDER BY id DESC LIMIT 1`,
      [phone, otp]
    );
    if (res.rows.length > 0) {
      await pool.query('DELETE FROM otps WHERE phone = $1', [phone]);
      return true;
    }
    return false;
  },

  async findOrCreateUser(phone: string): Promise<User> {
    const existing = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) {
      return existing.rows[0];
    }
    const created = await pool.query(
      'INSERT INTO users (phone) VALUES ($1) RETURNING *',
      [phone]
    );
    return created.rows[0];
  }
};
