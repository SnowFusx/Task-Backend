import nodemailer from 'nodemailer';

const emailRegistro = async datos => {
	const { email, nombre, token } = datos;

	const transport = nodemailer.createTransport({
		host: `${process.env.EMAIL_HOST}`,
		port: `${process.env.EMAIL_PORT}`,
		auth: {
			user: `${process.env.EMAIL_USER}`,
			pass: `${process.env.EMAIL_PASS}`,
		},
	});

	// Información del email

	const info = await transport.sendMail({
		from: '"UpTask - Administrador de proyectos" <cuentas@uptask.com>',
		to: email,
		subject: 'Confirma tu cuenta',
		text: `Hola ${nombre}, confirma tu cuenta haciendo click en el siguiente enlace: ${process.env.FRONTEND_URL}/confirmar/${token}`,
		html: `
            <h2>Hola ${nombre}</h2>
            <p>Confirma tu cuenta haciendo click en el siguiente enlace</p>
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar mi cuenta</a>
            <hr />
            <p>Si no has sido tú, ignora este mensaje</p>
        `,
	});
};

const emailResetPassword = async datos => {
	const { email, nombre, token } = datos;

	const transport = nodemailer.createTransport({
		host: `${process.env.EMAIL_HOST}`,
		port: `${process.env.EMAIL_PORT}`,
		auth: {
			user: `${process.env.EMAIL_USER}`,
			pass: `${process.env.EMAIL_PASS}`,
		},
	});

	// Información del email

	const info = await transport.sendMail({
		from: '"UpTask - Administrador de proyectos" <cuentas@uptask.com>',
		to: email,
		subject: 'Recuperar contraseña',
		text: `Hola ${nombre}, recupera tu contraseña haciendo click en el siguiente enlace: ${process.env.FRONTEND_URL}/reset-password/${token}`,
		html: `
            <h2>Hola ${nombre}</h2>
            <p>Recupera tu contraseña haciendo click en el siguiente enlace</p>
            <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Recuperar contraseña</a>
            <hr />
            <p>Si no has sido tú, ignora este mensaje</p>
        `,
	});
};

export { emailRegistro, emailResetPassword };
