import { Router } from 'express';
import { register, login } from '../controllers/authController'; // Login'i import ettik

const router = Router();

router.post('/register', register);
router.post('/login', login); // YENİ: Login rotası

export default router;