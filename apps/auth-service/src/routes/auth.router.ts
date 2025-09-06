import express, { Router } from 'express';
import { userRegisteration, verifyUser } from '../controller/auth.controller';

const router: Router = express.Router();

router.post('/user-registeration', userRegisteration);
router.post('/verify-user', verifyUser);

export default router;
