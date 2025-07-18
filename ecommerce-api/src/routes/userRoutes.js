
import express from 'express';
import {
    registerUser,
    getUsers,
    getuser,
    getUserById,
    updateUser,
    deleteUser,
    getUserWishlist,
    setFilterActive
} from '../controllers/userController.js';

const router = express.Router();
// Registrar un nuevo usuario
router.post('/users/register', registerUser);
// Obtener todos los usuarios (admin)
router.get('/users', getUsers);
// Obtener un usuario por ID
router.get('/users/:id', getUserById);
// Actualizar un usuario
router.put('/users/update/:id', updateUser);

// Eliminar un usuario
router.delete('/users/delete/:id', deleteUser);
// Obtener la lista de deseos de un usuario
router.get('/users/:userId/wishlist', getUserWishlist);
// Establecer el filtro activo para un usuario
router.post('/users/:userId/set-filter-active', setFilterActive);
// Obtener un usuario por ID (con filtro)
router.get('/users/user/:id', getuser);
// Actualizar un usuario (con filtro)
router.put('/users/user/:id', updateUser);
// Eliminar un usuario (con filtro)
router.delete('/users/user/:id', deleteUser);
export default router;
// Exportar el router para su uso en la aplicación principal
    