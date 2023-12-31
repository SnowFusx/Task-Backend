import moongose from 'mongoose';

const tareaSchema = moongose.Schema(
	{
		nombre: {
			type: String,
			required: true,
			trim: true,
		},
		descripcion: {
			type: String,
			required: true,
			trim: true,
		},
		estado: {
			type: Boolean,
			default: false,
		},
		fechaEntrega: {
			type: Date,
			required: true,
			default: Date.now(),
		},
		prioridad: {
			type: String,
			required: true,
			enum: ['baja', 'media', 'alta'],
		},
		proyecto: {
			type: moongose.Schema.Types.ObjectId,
			ref: 'Proyecto',
		},
		completado: {
			type: moongose.Schema.Types.ObjectId,
			ref: 'Usuario',
		},
	},
	{
		timestamps: true,
	}
);

const Tarea = moongose.model('Tarea', tareaSchema);
export default Tarea;
