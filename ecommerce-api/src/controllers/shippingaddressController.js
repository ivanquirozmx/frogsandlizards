
import ShippingAddress from "../models/shippingAddress";
async function createShippingAddress(req, res) {
  try {
    const { user, name, address, city, state, postalCode, country, phone, isDefault, addressType } = req.body;
    const newShippingAddress = new ShippingAddress({
      user,
      name,
      address,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault,
      addressType
    });
    await newShippingAddress.save();
    res.status(201).json(newShippingAddress);
  } catch (error) {
    res.status(500).send({ error: 'Error creating shipping address' });
  }
}
async function getShippingAddresses(req, res) {
  try {
    const shippingAddresses = await ShippingAddress.find().populate('user').sort({ name: 1 });
    res.json(shippingAddresses);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching shipping addresses' });
  }
}   
async function getShippingAddressById(req, res) {
  try {
    const { id } = req.params;
    const shippingAddress = await ShippingAddress.findById(id).populate('user');
    if (!shippingAddress) {
      return res.status(404).json({ message: 'Shipping address not found' });
    }
    res.json(shippingAddress);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching shipping address' });
  }
}
async function updateShippingAddress(req, res) {
  try {
    const { id } = req.params;
    const { name, address, city, state, postalCode, country, phone, isDefault, addressType } = req.body;
    const updatedShippingAddress = await ShippingAddress.findByIdAndUpdate(id, {
      name,
      address,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault,
      addressType
    }, { new: true });
    if (!updatedShippingAddress) {
      return res.status(404).json({ message: 'Shipping address not found' });
    }
    res.json(updatedShippingAddress);
  } catch (error) {
    res.status(500).send({ error: 'Error updating shipping address' });
  }
}
async function deleteShippingAddress(req, res) {
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
}



async function setDefaultShippingAddress(req, res) {
  try {
    const { userId, addressId } = req.body;
    // Reset all addresses for the user to not be default
    await ShippingAddress.updateMany({ user: userId }, { isDefault: false });
    // Set the specified address as default
    const updatedAddress = await ShippingAddress.findByIdAndUpdate(addressId, { isDefault: true }, { new: true });
    if (!updatedAddress) {
      return res.status(404).json({ message: 'Shipping address not found' });
    }
    res.json(updatedAddress);
  } catch (error) {
    res.status(500).send({ error: 'Error setting default shipping address' });
  }
}

async function getShippingAddressesByUser(req, res) {
  try {
    const userId = req.params.userId;
    const shippingAddresses = await ShippingAddress.find({ user: userId }).populate('user').sort({ name: 1 });
    if (shippingAddresses.length === 0) {
      return res.status(404).json({ message: 'No shipping addresses found for this user' });
    }
    res.json(shippingAddresses);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching shipping addresses for user' });
  }
}

export {
  createShippingAddress,
  getShippingAddresses,
  getShippingAddressById,
  updateShippingAddress,
  deleteShippingAddress,
  setDefaultShippingAddress,
  getShippingAddressesByUser
};
