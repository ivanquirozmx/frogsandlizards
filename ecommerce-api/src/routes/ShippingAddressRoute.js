
import express from 'express';

import ShippingAddress from '../models/shippingAddress';
import {
  createShippingAddress,
  getShippingAddresses,
    getShippingAddressById,
    updateShippingAddress,
    deleteShippingAddress,

} from '../controllers/shippingaddressController.js';

const router = express.Router();

// Obtener todas las direcciones de envío
router.get('/shipping-addresses', getShippingAddresses);

// Obtener dirección de envío por ID
router.get('/shipping-addresses/:id', getShippingAddressById);
// Crear nueva dirección de envío
router.post('/shipping-addresses/create', createShippingAddress);

// Actualizar dirección de envío
router.put('/shipping-addresses/update', updateShippingAddress);

// Eliminar dirección de envío
router.delete('/shipping-addresses/delete', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedShippingAddress = await ShippingAddress.findByIdAndDelete(id);
    if (!deletedShippingAddress) {
      return res.status(404).json({ message: 'Shipping address not found' });
    }
    res.json({ message: 'Shipping address deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Error deleting shipping address' });
  }
});

export default router;