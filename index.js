import express from 'express';
import dotenv from 'dotenv';
import { corsOptions } from './middleware/cors.js';
import conectarDB from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';
import configureSocket from './socketManager.js';

const app = express();
app.disable('x-powered-by'); // Deshabilita la cabecera X-Powered-By
app.use(express.json());

dotenv.config();

conectarDB();

// Habilitar CORS
app.use(corsOptions());

// Routing
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
	console.log(`Servidor funcionando en el puerto ${PORT}`);
});

// Configurar socket.io
configureSocket(servidor);
