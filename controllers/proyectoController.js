import Proyecto from '../models/Proyecto.js';
import Usuario from '../models/Usuario.js';

const obtenerProyectos = async (req, res) => {
	const proyectos = await Proyecto.find({
		$or: [
			{ creador: { $in: req.usuario } },
			{ colaboradores: { $in: req.usuario } },
		],
	}).select('-tareas');
	res.json(proyectos);
};

const nuevoProyecto = async (req, res) => {
	const proyecto = new Proyecto(req.body);
	proyecto.creador = req.usuario.id;

	try {
		const proyectoCreado = await proyecto.save();
		res.json(proyectoCreado);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		res.status(500).json({ msg: 'Hubo un error al crear el proyecto' });
	}
};

const obtenerProyecto = async (req, res) => {
	const { id } = req.params;

	if (id.trim().length !== 24) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	const proyecto = await Proyecto.findById(id.trim())
		.populate({
			path: 'tareas',
			populate: {
				path: 'completado',
				select: '-password -confirmado -createdAt -updatedAt -__v -token',
			},
		})
		.populate(
			'colaboradores',
			'-password -confirmado -createdAt -updatedAt -__v -token'
		);
	if (!proyecto) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	if (
		proyecto.creador.toString() !== req.usuario.id.toString() &&
		!proyecto.colaboradores.some(
			colaborador =>
				colaborador._id.toString() === req.usuario.id.toString()
		)
	) {
		const error = new Error('No autorizado');
		return res.status(401).json({ msg: error.message });
	}

	res.json(proyecto);
};

const editarProyecto = async (req, res) => {
	const { id } = req.params;

	if (id.trim().length !== 24) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	const proyecto = await Proyecto.findById(id.trim());

	if (!proyecto) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	if (proyecto.creador.toString() !== req.usuario.id.toString()) {
		const error = new Error('No autorizado');
		return res.status(401).json({ msg: error.message });
	}

	proyecto.nombre = req.body.nombre || proyecto.nombre;
	proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
	proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
	proyecto.cliente = req.body.cliente || proyecto.cliente;

	try {
		const proyectoActualizado = await proyecto.save();
		res.json(proyectoActualizado);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		res.status(500).json({
			msg: 'Hubo un error al actualizar el proyecto',
		});
	}
};

const eliminarProyecto = async (req, res) => {
	console.log(req.params);
	const { id } = req.params;

	if (id.trim().length !== 24) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	const proyecto = await Proyecto.findById(id).populate('tareas');

	if (!proyecto) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	if (proyecto.creador.toString() !== req.usuario.id.toString()) {
		const error = new Error('No autorizado');
		return res.status(401).json({ msg: error.message });
	}

	try {
		await proyecto.tareas.forEach(async tarea => {
			await tarea.deleteOne();
		});
		await proyecto.deleteOne();
		res.json({ msg: 'Proyecto eliminado' });
	} catch (error) {
		console.error(`Error: ${error.message}`);
		res.status(500).json({ msg: 'Hubo un error al eliminar el proyecto' });
	}
};

const buscarColaborador = async (req, res) => {
	const { email } = req.body;

	if (!email) {
		const error = new Error(
			'El email es obligatorio para buscar un usuario'
		);
		return res.status(400).json({ msg: error.message });
	}

	const usuario = await Usuario.findOne({ email }).select(
		'-password -confirmado -createdAt -updatedAt -__v -token'
	);
	if (!usuario) {
		const error = new Error('No existe ningún usuario con ese email');
		return res.status(404).json({ msg: error.message });
	}

	res.json(usuario);
};

const agregarColaborador = async (req, res) => {
	const proyecto = await Proyecto.findById(req.params.id);

	if (!proyecto) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	if (proyecto.creador.toString() !== req.usuario.id.toString()) {
		const error = new Error('No autorizado');
		return res.status(401).json({ msg: error.message });
	}

	const { email } = req.body;

	if (!email) {
		const error = new Error(
			'El email es obligatorio para agregar un usuario'
		);
		return res.status(400).json({ msg: error.message });
	}

	const usuario = await Usuario.findOne({ email }).select(
		'-password -confirmado -createdAt -updatedAt -__v -token'
	);
	if (!usuario) {
		const error = new Error('No existe ningún usuario con ese email');
		return res.status(404).json({ msg: error.message });
	}

	// Asegurar que el colaborador a añadir no es el creador del proyecto
	if (usuario._id.toString() === proyecto.creador.toString()) {
		const error = new Error(
			'Ya eres el creador del proyecto, no puedes ser colaborador'
		);
		return res.status(400).json({ msg: error.message });
	}

	// Asegurar que el colaborador no está ya en el proyecto
	if (proyecto.colaboradores.includes(usuario._id.toString())) {
		const error = new Error(
			'El usuario ya es colaborador del proyecto, no puedes añadirlo de nuevo'
		);
		return res.status(400).json({ msg: error.message });
	}

	// Añadir el colaborador al proyecto
	proyecto.colaboradores.push(usuario._id);

	try {
		await proyecto.save();
		res.status(200).json({ msg: 'Colaborador agregado correctamente' });
	} catch (error) {
		console.error(`Error: ${error.message}`);
		res.status(500).json({
			msg: 'Hubo un error al agregar el colaborador al proyecto',
		});
	}
};

const eliminarColaborador = async (req, res) => {
	const proyecto = await Proyecto.findById(req.params.id);

	if (!proyecto) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	if (proyecto.creador.toString() !== req.usuario.id.toString()) {
		const error = new Error('No autorizado');
		return res.status(401).json({ msg: error.message });
	}

	// Eliminar el colaborador del proyecto
	proyecto.colaboradores.pull(req.body.id);

	try {
		await proyecto.save();
		res.json({ msg: 'Colaborador eliminado correctamente' });
	} catch (error) {
		console.error(`Error: ${error.message}`);
		res.status(500).json({
			msg: 'Hubo un error al eliminar el colaborador del proyecto',
		});
	}
};

export {
	obtenerProyectos,
	nuevoProyecto,
	obtenerProyecto,
	editarProyecto,
	eliminarProyecto,
	buscarColaborador,
	agregarColaborador,
	eliminarColaborador,
};
