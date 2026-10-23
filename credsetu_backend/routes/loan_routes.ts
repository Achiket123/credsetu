import { Router } from 'express';
import multer from 'multer';
import { LoanController } from '../controllers/loan_controllers';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Public receipt image stream endpoint (can be loaded by <Image source={{ uri }} />)
router.get('/receipts/:id', LoanController.getReceipt);

// Apply auth middleware to protect loan and upload endpoints
router.use(authMiddleware);

// Upload receipt bytes endpoint
router.post('/receipts', upload.single('receipt'), LoanController.uploadReceipt);

router.get('/', LoanController.getLoans);
router.post('/', LoanController.createLoan);
router.patch('/:id/repay', LoanController.markRepaid);
router.get('/summary', LoanController.getSummary);

export default router;
