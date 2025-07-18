


import wishlist from '../models/wishlist.js';

async function getwishlists(req, res) {
  try {
    const orders = await wishlist.find()
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod')
      .sort({ status: 1 });
    res.json(orders);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function getwishlistById(req, res) {
  try {
    const id = req.params.id;
    const order = await wishlist.findById(id)
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod');
    if (!order) {
      return res.status(404).json({ message: 'wishlist not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function getwishlistsByUser(req, res) {
  try {
    const userId = req.params.userId;
    const orders = await wishlist.find({ user: userId })
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod')
      .sort({ status: 1 });

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function createwishlist(req, res) {
  try {
    const {
      user,
      products,
      shippingAddress,
      paymentMethod,
      shippingCost = 0
    } = req.body;

    // Validaciones básicas
    if (!user || !products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'User and products array are required' });
    }
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ error: 'Shipping address and payment method are required' });
    }

    // Validar estructura de productos
    for (const item of products) {
      if (!item.productId || !item.quantity || !item.price || item.quantity < 1) {
        return res.status(400).json({
          error: 'Each product must have productId, quantity >= 1, and price'
        });
      }
    }

    // Calcular precio total
    const subtotal = products.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalPrice = subtotal + shippingCost;

    const newwishlist = await wishlist.create({
      user,
      products,
      shippingAddress,
      paymentMethod,
      shippingCost,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await newwishlist.populate('user');
    await newwishlist.populate('products.productId');
    await newwishlist.populate('shippingAddress');
    await newwishlist.populate('paymentMethod');

    res.status(201).json(newwishlist);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function updatewishlist(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Solo permitir actualizar ciertos campos
    const allowedFields = ['status', 'paymentStatus', 'shippingCost'];
    const filteredUpdate = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdate[field] = updateData[field];
      }
    }

    // Si se actualiza shippingCost, recalcular totalPrice
    if (filteredUpdate.shippingCost !== undefined) {
      const order = await wishlist.findById(id);
      if (order) {
        const subtotal = order.products.reduce((total, item) => total + (item.price * item.quantity), 0);
        filteredUpdate.totalPrice = subtotal + filteredUpdate.shippingCost;
      }
    }

    const updatedwishlist = await wishlist.findByIdAndUpdate(
      id,
      filteredUpdate,
      { new: true }
    )
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod');

    if (updatedwishlist) {
      return res.status(200).json(updatedwishlist);
    } else {
      return res.status(404).json({ message: 'wishlist not found' });
    }
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function cancelwishlist(req, res) {
  try {
    const { id } = req.params;

    const order = await wishlist.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'wishlist not found' });
    }

    // Solo permitir cancelar si el estado lo permite
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        message: 'Cannot cancel order with status: ' + order.status
      });
    }

    const updatedwishlist = await wishlist.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : 'failed'
      },
      { new: true }
    )
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod');

    res.status(200).json(updatedwishlist);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function updatewishlistStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
      });
    }

    const updatedwishlist = await wishlist.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod');

    if (updatedwishlist) {
      return res.status(200).json(updatedwishlist);
    } else {
      return res.status(404).json({ message: 'wishlist not found' });
    }
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function updatePaymentStatus(req, res) {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        error: 'Invalid payment status. Valid statuses: ' + validPaymentStatuses.join(', ')
      });
    }

    const updatedwishlist = await wishlist.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    )
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod');

    if (updatedwishlist) {
      return res.status(200).json(updatedwishlist);
    } else {
      return res.status(404).json({ message: 'wishlist not found' });
    }
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function deletewishlist(req, res) {
  try {
    const { id } = req.params;

    const order = await wishlist.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'wishlist not found' });
    }

    // Solo permitir eliminar órdenes canceladas
    if (order.status !== 'cancelled') {
      return res.status(400).json({
        message: 'Only cancelled orders can be deleted'
      });
    }

    await wishlist.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error });
  }
}

export {
  getwishlists,
  getwishlistById,
  getwishlistsByUser,
  createwishlist,
  updatewishlist,
  cancelwishlist,
  updatewishlistStatus,
  updatePaymentStatus,
  deletewishlist,
};
