// /src/lib/utils/parser.js
import { ObjectId } from 'mongodb';

export default {
	id: (val) => (ObjectId.isValid(val) ? new ObjectId(val) : null),
	date: (val) => new Date(val)
};
