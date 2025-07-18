
import User from '../models/userModel.js';

async function registerUser(req, res, next) {
    console.log('Registering user...');
    userModel.registerUser(req.body)
    .then(() => res.redirect('/login'))
    .catch(error => {
        console.error('Error registering user:', error);
        res.status(500).send({ error: 'Error registering user' });
    });
}

async function getUsers(req, res) {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function getUser(req, res, next) {
    userModel.getUser(req.params.id)
        .then((user) => {
            req.user = user;  // Attach the user to the request object
            next();  // Pass control to the next middleware
        })
        .catch((err) => {
            res.sendStatus(500)
        })
}
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, {
      name, email, password
    }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).send({ error });
  }
}
   
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).send({ error });
  }
}
async function getUserWishlist(req, res) {
  try {
    const userId = req.params.userId;
    const userWishlist = await User.findById(userId)
      .populate('products.product')
      .select('products');
    
    if (!userWishlist) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(userWishlist.products);
  } catch (error) {
    res.status(500).send({ error });
  }
}   

async function setFilterActive(req, res) {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ error: 'User ID and Product ID are required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const productIndex = user.products.findIndex(p => p.product.toString() === productId);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }
    
    user.products[productIndex].active = true;
    await user.save();
    
    res.json({ message: 'Product set as active in wishlist' });
  } catch (error) {
    res.status(500).send({ error });
  }
}

module.exports = {
    registerUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    getUserWishlist,
    setFilterActive
}