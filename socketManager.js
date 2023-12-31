// Socket.io
import { Server } from 'socket.io';

const configureSocket = servidor => {
	const io = new Server(servidor, {
		pingTimeout: 6000,
		cors: {
			origin: process.env.FRONTEND_URL,
		},
	});

	io.on('connection', socket => {
		console.log('Conectado a socket.io');

		// Definir los eventos de socket io

		// ------ Eventos de proyecto individual ------
		socket.on('abrir-proyecto', proyecto => {
			socket.join(proyecto);
		});

		socket.on('nueva-tarea', tareaAlmacenada => {
			const proyectoId = tareaAlmacenada.proyecto;

			socket.to(proyectoId).emit('tarea-agregada', tareaAlmacenada);
		});

		socket.on('completar-tarea', tareaAlmacenada => {
			const proyectoId = tareaAlmacenada.proyecto._id;

			socket.to(proyectoId).emit('tarea-completada', tareaAlmacenada);
		});

		socket.on('eliminar-tarea', tarea => {
			const proyectoId = tarea.proyecto;

			socket.to(proyectoId).emit('tarea-eliminada', tarea);
		});

		socket.on('editar-tarea', tareaActualizada => {
			const proyectoId = tareaActualizada.proyecto._id;

			socket.to(proyectoId).emit('tarea-actualizada', tareaActualizada);
		});
	});

	// ------ Fin Eventos de proyecto individual ------

	// ------ Eventos de proyecto global ------
};

export default configureSocket;
