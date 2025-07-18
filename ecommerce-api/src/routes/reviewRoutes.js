


import express from 'express';
import {
  getREviews,
  getReviewById,
    getReviewsByUser,
    createReview,
    updateReview,
    deleteReview,
    cancelReview,
    updateReviewStatus,


  } from '../controllers/orderController.js';

const router = express.Router();

// Obtener todas las órdenes (admin)
router.get('/reviews', getwishlists);

// Obtener órdenes por usuario
router.get('/orders/user/:userId', getwishlistsByUser);

// Obtener orden por ID
router.get('/orders/:id', getReviewById);

// Crear nueva orden
router.post('/orders', createReview);

// Cancelar orden (función especial)
router.patch('/orders/:id/cancel', cancelReview);

// Actualizar solo el estado de la orden
router.patch('/orders/:id/status', updateReviewStatus);



// Actualizar orden completa
router.put('/orders/:id', updateReview);

// Eliminar orden (solo si está cancelada)
router.delete('/orders/:id', deleteReview);

export default router;
