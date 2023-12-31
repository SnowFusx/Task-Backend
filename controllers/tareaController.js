import Tarea from '../models/Tarea.js';
import Proyecto from '../models/Proyecto.js';

const agregarTarea = async (req, res) => {
	// Extraer el proyecto y comprobar si existe
	const { proyecto } = req.body;

	if (proyecto.trim().length !== 24) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	const existeProyecto = await Proyecto.findById(proyecto);
	if (!existeProyecto) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}
	// Revisar si el proyecto actual pertenece al usuario autenticado
	// Verificar el creador del proyecto
	if (existeProyecto.creador.toString() !== req.usuario.id.toString()) {
		return res.status(401).json({ msg: 'No autorizado' });
	}

	// Creamos la tarea
	try {
		const tareaAlmacenada = await Tarea.create(req.body);
		// Agregamos la tarea al proyecto con su ID
		existeProyecto.tareas.push(tareaAlmacenada._id);
		await existeProyecto.save();
		// Respondemos con la tarea almacenada
		res.json({ tareaAlmacenada });
	} catch (error) {
		console.log(error);
	}
};

const obtenerTarea = async (req, res) => {
	const { id } = req.params;

	if (id.trim().length !== 24) {
		const error = new Error('Tarea no encontrada');
		return res.status(404).json({ msg: error.message });
	}

	const tarea = await Tarea.findById(id).populate('proyecto');

	if (tarea.proyecto.creador.toString() !== req.usuario.id.toString()) {
		return res.status(401).json({ msg: 'No autorizado' });
	}

	if (!tarea) {
		const error = new Error('Tarea no encontrada');
		return res.status(404).json({ msg: error.message });
	}

	res.json({ tarea });
};

const actualizarTarea = async (req, res) => {
	const { id } = req.params;

	if (id.trim().length !== 24) {
		const error = new Error('Tarea no encontrada');
		return res.status(404).json({ msg: error.message });
	}

	const tarea = await Tarea.findById(id).populate('proyecto');

	if (tarea.proyecto.creador.toString() !== req.usuario.id.toString()) {
		return res.status(401).json({ msg: 'No autorizado' });
	}

	if (!tarea) {
		const error = new Error('Tarea no encontrada');
		return res.status(404).json({ msg: error.message });
	}

	tarea.nombre = req.body.nombre || tarea.nombre;
	tarea.descripcion = req.body.descripcion || tarea.descripcion;
	tarea.estado = req.body.estado || tarea.estado;
	tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;
	tarea.prioridad = req.body.prioridad || tarea.prioridad;

	try {
		const tareaActualizada = await tarea.save();
		res.json({ tareaActualizada });
	} catch (error) {
		console.log(error);
	}
};

const eliminarTarea = async (req, res) => {
	const { id } = req.params;

	if (id.trim().length !== 24) {
		const error = new Error('Tarea no encontrada');
		return res.status(404).json({ msg: error.message });
	}

	const tarea = await Tarea.findById(id).populate('proyecto');

	if (tarea.proyecto.creador.toString() !== req.usuario.id.toString()) {
		return res.status(401).json({ msg: 'No autorizado' });
	}

	if (!tarea) {
		const error = new Error('Tarea no encontrada');
		return res.status(404).json({ msg: error.message });
	}

	try {
		const proyecto = await Proyecto.findById(tarea.proyecto);
		proyecto.tareas.pull(tarea._id);

		await Promise.allSettled([proyecto.save(), tarea.deleteOne()]);

		await tarea.deleteOne();

		res.json({ msg: 'Tarea eliminada' });
	} catch (error) {
		console.log(error);
	}
};

const cambiarEstadoTarea = async (req, res) => {
	const { id } = req.params;

	if (id.trim().length !== 24) {
		const error = new Error('Tarea no encontrada');
		return res.status(404).json({ msg: error.message });
	}

	const tarea = await Tarea.findById(id).populate('proyecto');

	if (
		tarea.proyecto.creador.toString() !== req.usuario.id.toString() &&
		!tarea.proyecto.colaboradores.some(
			colaborador =>
				colaborador._id.toString() === req.usuario._id.toString()
		)
	) {
		return res.status(401).json({ msg: 'No autorizado' });
	}

	if (!tarea) {
		const error = new Error('Tarea no encontrada');
		return res.status(404).json({ msg: error.message });
	}

	try {
		tarea.estado = !tarea.estado;
		tarea.completado = req.usuario.id;
		await tarea.save();

		const tareaAlmacenada = await Tarea.findById(id)
			.populate('proyecto')
			.populate('completado');

		res.json({ tareaAlmacenada });
	} catch (error) {
		console.log(error);
		return res.status(401).json({ msg: 'No autorizado' });
	}
};

export {
	agregarTarea,
	obtenerTarea,
	actualizarTarea,
	eliminarTarea,
	cambiarEstadoTarea,
};
