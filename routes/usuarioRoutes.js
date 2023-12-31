import express from 'express';
import { UsuarioController } from '../controllers/usuarioController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

const {
	registrar,
	autenticar,
	confirmar,
	olvidePassword,
	comprobarToken,
	nuevoPassword,
	perfil,
} = UsuarioController;

// Autenticación, Registro y Confirmación de Usuarios
router.post('/', registrar); // Crea un nuevo usuario
router.post('/login', autenticar);
router.get('/confirmar/:token', confirmar);
router.post('/olvide-password', olvidePassword);
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword);
router.get('/perfil', checkAuth, perfil); // Obtiene el perfil del usuario

export default router;
