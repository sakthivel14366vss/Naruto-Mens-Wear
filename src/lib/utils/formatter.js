// /src/lib/utils/formatter.js

export default {
	number: (val) => (isNaN(Number(val)) ? 0 : Number(val)),
	camelToTitle: (val) => val[0].toUpperCase() + val.slice(1).replace(/([A-Z])/g, ' $1')
};
