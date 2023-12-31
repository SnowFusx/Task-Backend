const generarId = () => {
	const random = Math.random().toString(32).substr(2);
	const id = `${Date.now().toString(32)}${random}`;
	return id;
};
export default generarId;
