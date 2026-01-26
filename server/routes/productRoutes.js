import express from 'express';
import {
  createProduct,
  updateProduct,
  getProducts,
} from '../controllers/productController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getProducts);
router.post('/', authMiddleware, roleMiddleware(['admin']), createProduct);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateProduct);

export default router;
