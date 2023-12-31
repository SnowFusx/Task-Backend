import mongoose from 'mongoose';

const conectarDB = async () => {
	try {
		const connecttion = await mongoose.connect(process.env.MONGO_URI, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
		});

		const url = `${connecttion.connection.host}:${connecttion.connection.port}`;
		console.log(`MongoDB conectado en: ${url}`);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		process.exit(1);
	}
};

export default conectarDB;
