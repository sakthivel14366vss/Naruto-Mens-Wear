// /src/lib/utils/parser.js
import { ObjectId } from 'mongodb';

export default {
	id: (val) => new ObjectId(val),
	date: (val) => new Date(val)
};
