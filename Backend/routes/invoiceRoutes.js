import express from 'express';
const router = express.Router();
// Verificamos que apunte a controllers con la extensión .js
import invoiceController from '../controllers/invoice.controller.js';

router.get('/', invoiceController.getAllInvoices);

export default router;