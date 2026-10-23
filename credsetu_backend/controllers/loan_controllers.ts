import { Response } from 'express';
import { LoanModel } from '../models/loan_models';
import { AuthenticatedRequest } from '../middleware/auth';

import { Request } from 'express';

export const LoanController = {
  async uploadReceipt(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userPhone = req.user?.phone;
      if (!userPhone) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No receipt file uploaded' });
        return;
      }

      const receiptId = await LoanModel.saveReceipt({
        userPhone,
        filename: req.file.originalname,
        mimeType: req.file.mimetype || 'image/jpeg',
        data: req.file.buffer,
      });

      // Construct receipt URL using the receipt ID
      const receiptUrl = `/api/loans/receipts/${receiptId}`;

      res.status(201).json({
        id: receiptId,
        receiptUrl,
        message: 'Receipt uploaded and stored in database successfully',
      });
    } catch (error) {
      console.error('[uploadReceipt error]', error);
      res.status(500).json({ error: 'Failed to upload receipt' });
    }
  },

  async getReceipt(req: Request, res: Response): Promise<void> {
    try {
      const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const receiptId = parseInt(rawId, 10);
      if (isNaN(receiptId)) {
        res.status(400).json({ error: 'Invalid receipt id' });
        return;
      }

      const receipt = await LoanModel.getReceiptById(receiptId);
      if (!receipt) {
        res.status(404).json({ error: 'Receipt not found' });
        return;
      }

      res.setHeader('Content-Type', receipt.mime_type);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for performance
      res.send(receipt.data);
    } catch (error) {
      console.error('[getReceipt error]', error);
      res.status(500).json({ error: 'Failed to retrieve receipt' });
    }
  },
  async getLoans(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userPhone = req.user?.phone;
      if (!userPhone) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const loans = await LoanModel.getLoansByUser(userPhone);
      // Map to frontend friendly shape
      const formatted = loans.map((l) => ({
        id: l.id.toString(),
        friendName: l.friend_name,
        amount: Number(l.amount),
        dueDate: l.due_date,
        repaid: l.repaid,
        receiptUrl: l.receipt_url || undefined,
        createdAt: l.created_at,
      }));

      res.status(200).json(formatted);
    } catch (error) {
      console.error('[getLoans error]', error);
      res.status(500).json({ error: 'Failed to fetch loans' });
    }
  },

  async createLoan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userPhone = req.user?.phone;
      if (!userPhone) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { friendName, amount, dueDate, receiptUrl } = req.body;

      if (!friendName || typeof friendName !== 'string' || friendName.trim().length < 2) {
        res.status(400).json({ error: 'Valid friend name is required' });
        return;
      }

      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        res.status(400).json({ error: 'Amount must be a positive number' });
        return;
      }

      if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || isNaN(Date.parse(dueDate))) {
        res.status(400).json({ error: 'Due date must be in YYYY-MM-DD format' });
        return;
      }

      const created = await LoanModel.createLoan({
        userPhone,
        friendName: friendName.trim(),
        amount: numAmount,
        dueDate,
        receiptUrl: receiptUrl || null,
      });

      res.status(201).json({
        id: created.id.toString(),
        friendName: created.friend_name,
        amount: Number(created.amount),
        dueDate: created.due_date,
        repaid: created.repaid,
        receiptUrl: created.receipt_url || undefined,
        createdAt: created.created_at,
      });
    } catch (error) {
      console.error('[createLoan error]', error);
      res.status(500).json({ error: 'Failed to create loan entry' });
    }
  },

  async markRepaid(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userPhone = req.user?.phone;
      if (!userPhone) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const loanId = parseInt(rawId, 10);
      if (isNaN(loanId)) {
        res.status(400).json({ error: 'Invalid loan id' });
        return;
      }

      const updated = await LoanModel.markAsRepaid(loanId, userPhone);
      if (!updated) {
        res.status(404).json({ error: 'Loan not found or not owned by user' });
        return;
      }

      res.status(200).json({
        id: updated.id.toString(),
        friendName: updated.friend_name,
        amount: Number(updated.amount),
        dueDate: updated.due_date,
        repaid: updated.repaid,
        receiptUrl: updated.receipt_url || undefined,
        createdAt: updated.created_at,
      });
    } catch (error) {
      console.error('[markRepaid error]', error);
      res.status(500).json({ error: 'Failed to mark loan as repaid' });
    }
  },

  async getSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userPhone = req.user?.phone;
      if (!userPhone) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const summary = await LoanModel.getSummary(userPhone);
      res.status(200).json(summary);
    } catch (error) {
      console.error('[getSummary error]', error);
      res.status(500).json({ error: 'Failed to calculate summary' });
    }
  },
};


