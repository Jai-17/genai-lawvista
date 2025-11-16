import {Router} from 'express';
import { chat, identifyLegalStatutes, summarizePDF, viewPDF } from './controller';

const router = Router();

router.post('/chat', chat);
router.get('/pdf/:id/view', viewPDF);
router.get('/pdf/:id/summarize', summarizePDF);
router.get('/pdf/:id/legal-statutes', identifyLegalStatutes);

export default router;