// /src/lib/utils/formatter.js

export default {
	number: (val) => (isNaN(Number(val)) ? 0 : Number(val)),
	camelToTitle: (val) => val[0].toUpperCase() + val.slice(1).replace(/([A-Z])/g, ' $1'),
	numberWithCommas: (val) => {
		if (val === undefined || val === null || isNaN(val)) return '';
		return new Intl.NumberFormat('en-IN', {
			maximumFractionDigits: 2 // Adjust this if you need more or fewer decimal places
		}).format(val);
	}
};
