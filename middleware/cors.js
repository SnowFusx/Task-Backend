import cors from 'cors';
import dotenv from 'dotenv';

// Configuración de CORS

dotenv.config();

const whitelist = [process.env.FRONTEND_URL];

export const corsOptions = ({ acceptedOrigins = whitelist } = {}) =>
	cors({
		origin: (origin, callback) => {
			if (acceptedOrigins.includes(origin)) {
				// Se permite la solicitud
				callback(null, true);
			} else {
				// Se deniega la solicitud
				callback(new Error('No permitido por CORS'));
			}
		},
	});
