import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const checkAuth = async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		try {
			token = req.headers.authorization.split(' ')[1];
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			req.usuario = await Usuario.findById(decoded.id).select(
				'-password -confirmado -token -createdAt -updatedAt -__v' // No incluir el password y los otros parámetros en el req.usuario
			);

			return next();
		} catch (error) {
			console.error(`Error: ${error.message}`);
			return res.status(401).json({ msg: 'Hubo un error con el token' });
		}
	}

	if (!token) {
		return res.status(401).json({ msg: 'No autorizado, no hay token' });
	}

	next();
};

export default checkAuth;
