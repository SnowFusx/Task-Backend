import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = mongoose.Schema(
	{
		nombre: {
			type: String,
			required: true,
			trim: true, // Elimina espacios en blanco al principio y al final
		},
		email: {
			type: String,
			required: true,
			trim: true,
			unique: true, // No puede haber dos usuarios con el mismo email
		},
		password: {
			type: String,
			required: true,
			trim: true,
		},
		token: {
			type: String,
		},
		confirmado: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

usuarioSchema.pre('save', async function (next) {
	// Si el password no ha sido modificado, ejecutar el siguiente middleware
	if (!this.isModified('password')) {
		next();
	}

	// Encriptar el password
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

usuarioSchema.methods.compararPassword = async function (passwordFormulario) {
	return await bcrypt.compare(passwordFormulario, this.password);
	//return (await passwordFormulario) === this.password;
};

const Usuario = mongoose.model('Usuario', usuarioSchema);
export default Usuario;
