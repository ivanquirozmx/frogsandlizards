

import express from 'express';
import {
  getwishlists,
  getwishlistById,
  getwishlistsByUser,
  createwishlist,
  updatewishlist,
  cancelwishlist,
  updatewishlistStatus,
  updatePaymentStatus,
  deletewishlist,
} from '../controllers/orderController.js';

const router = express.Router();

// Obtener todas las órdenes (admin)
router.get('/orders', getwishlists);

// Obtener órdenes por usuario
router.get('/orders/user/:userId', getwishlistsByUser);

// Obtener orden por ID
router.get('/orders/:id', getwishlistById);

// Crear nueva orden
router.post('/orders', createwishlist);

// Cancelar orden (función especial)
router.patch('/orders/:id/cancel', cancelwishlist);

// Actualizar solo el estado de la orden
router.patch('/orders/:id/status', updatewishlistStatus);

// Actualizar solo el estado de pago
router.patch('/orders/:id/payment-status', updatePaymentStatus);

// Actualizar orden completa
router.put('/orders/:id', updatewishlist);

// Eliminar orden (solo si está cancelada)
router.delete('/orders/:id', deletewishlist);

export default router;
