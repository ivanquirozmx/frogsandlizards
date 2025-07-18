

import Review from '../models/review.js';

async function getReviews(req, res) {
  try {
    const Reviews = await Review.find()
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod')
      .sort({ status: 1 });
    res.json(Reviews);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function getReviewById(req, res) {
  try {
    const id = req.params.id;
    const Review = await Review.findById(id)
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod');
    if (!Review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(Review);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function getReviewsByUser(req, res) {
  try {
    const userId = req.params.userId;
    const Reviews = await Review.find({ user: userId })
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod')
      .sort({ status: 1 });

    if (Reviews.length === 0) {
      return res.status(404).json({ message: 'No Reviews found for this user' });
    }
    res.json(Reviews);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function createReview(req, res) {
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

    const newReview = await Review.create({
      user,
      products,
      shippingAddress,
      paymentMethod,
      shippingCost,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await newReview.populate('user');
    await newReview.populate('products.productId');
    await newReview.populate('shippingAddress');
    await newReview.populate('paymentMethod');

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function updateReview(req, res) {
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
      const Review = await Review.findById(id);
      if (Review) {
        const subtotal = Review.products.reduce((total, item) => total + (item.price * item.quantity), 0);
        filteredUpdate.totalPrice = subtotal + filteredUpdate.shippingCost;
      }
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      filteredUpdate,
      { new: true }
    )
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod');

    if (updatedReview) {
      return res.status(200).json(updatedReview);
    } else {
      return res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function cancelReview(req, res) {
  try {
    const { id } = req.params;

    const Review = await Review.findById(id);
    if (!Review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Solo permitir cancelar si el estado lo permite
    if (Review.status === 'delivered' || Review.status === 'cancelled') {
      return res.status(400).json({
        message: 'Cannot cancel Review with status: ' + Review.status
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        paymentStatus: Review.paymentStatus === 'paid' ? 'refunded' : 'failed'
      },
      { new: true }
    )
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod');

    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function updateReviewStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod');

    if (updatedReview) {
      return res.status(200).json(updatedReview);
    } else {
      return res.status(404).json({ message: 'Review not found' });
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

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    )
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod');

    if (updatedReview) {
      return res.status(200).json(updatedReview);
    } else {
      return res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function deleteReview(req, res) {
  try {
    const { id } = req.params;

    const Review = await Review.findById(id);
    if (!Review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Solo permitir eliminar órdenes canceladas
    if (Review.status !== 'cancelled') {
      return res.status(400).json({
        message: 'Only cancelled Reviews can be deleted'
      });
    }

    await Review.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error });
  }
}

export {
  getReviews,
  getReviewById,
  getReviewsByUser,
  createReview,
  updateReview,
  cancelReview,
  updateReviewStatus,
  updatePaymentStatus,
  deleteReview,
};
