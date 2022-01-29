import { Router } from 'express';
import { githubCallback, socialCallback, socialRegister, socialRedirect } from './social';

const router = Router();

router.get('/callback/github', githubCallback, socialCallback);

router.get('/redirect/:provider', socialRedirect);

router.post('/register', socialRegister);

export default router;
