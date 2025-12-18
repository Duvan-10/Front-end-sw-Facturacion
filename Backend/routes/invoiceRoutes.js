import express from 'express';
const router = express.Router();
// Verificamos que apunte a controllers con la extensión .js
import invoiceController from '../controllers/invoice.controller.js';

router.get('/proximo-numero', invoiceController.getNextNumber);
router.get('/', invoiceController.getAllInvoices);
router.post('/', invoiceController.createInvoice);

export default router;