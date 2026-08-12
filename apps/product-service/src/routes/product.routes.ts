import express, { Router } from 'express';
import {
  getCategories,
  deleteDiscountCode,
  getDiscountCodes,
  createDiscountCodes,
} from '../controller/product.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isSeller } from '@packages/middleware/authorizeRoles';

const router: Router = express.Router();

router.get('/get-categories', getCategories);

// Create discount codes
router.get('/get-discount-codes', isAuthenticated, isSeller, getDiscountCodes);
router.post(
  '/create-discount-code',
  isAuthenticated,
  isSeller,
  createDiscountCodes
);
router.delete(
  '/delete-discount-code/:id',
  isAuthenticated,
  isSeller,
  deleteDiscountCode
);

export default router;
