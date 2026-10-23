import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthModel } from '../models/auth_models';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_credsetu_key_2026';

export const AuthController = {
  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { phone } = req.body;
      if (!phone || typeof phone !== 'string' || !/^\d{10}$/.test(phone.trim())) {
        res.status(400).json({ error: 'Please provide a valid 10-digit phone number' });
        return;
      }

      const cleanPhone = phone.trim();

      const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();

      await AuthModel.saveOtp(cleanPhone, mockOtp);

      console.log(`Phone: ${cleanPhone} | OTP: ${mockOtp}`);

      res.status(200).json({
        message: 'OTP sent successfully',
        phone: cleanPhone,
      });
    } catch (error) {
      console.error('[sendOtp error]', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  },

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) {
        res.status(400).json({ error: 'Phone and OTP are required' });
        return;
      }

      const cleanPhone = phone.trim();
      const cleanOtp = otp.toString().trim();

      // Check OTP in DB, or accept universal dev OTP '1234'
      const isValid = cleanOtp === '1234' || (await AuthModel.verifyOtp(cleanPhone, cleanOtp));

      if (!isValid) {
        res.status(400).json({ error: 'Invalid or expired OTP' });
        return;
      }

      const user = await AuthModel.findOrCreateUser(cleanPhone);
      const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, {
        expiresIn: '7d',
      });

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          phone: user.phone,
        },
      });
    } catch (error) {
      console.error('[verifyOtp error]', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  },
};
