//Get Now
const getFormattedTime = (date) => {
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
};
// Get 1H after
const getOneHourLater = () => {
	const now = new Date();
	now.setHours(now.getHours() + 1);
	return getFormattedTime(now);
};

module.exports = { getOneHourLater };
