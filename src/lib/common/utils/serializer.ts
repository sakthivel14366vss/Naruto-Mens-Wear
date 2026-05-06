import { ObjectId } from 'mongodb';

const hiddenFields = ['password', 'token', 'OTP', 'secret', 'hashed_password'] as const;

/**
 * Serialize MongoDB document(s) for sending to client
 * Converts ObjectId -> string, Date -> ISO string
 */
export function serializeDoc<T>(doc: T): unknown {
  if (!doc) return null;

  // Handle Arrays
  if (Array.isArray(doc)) {
    return doc.map((d) => serializeDoc(d));
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(doc as Record<string, unknown>)) {
    // Hide sensitive fields
    if ((hiddenFields as readonly string[]).includes(key)) continue;

    if (value instanceof ObjectId) {
      result[key] = value.toString();
    } else if (value instanceof Date) {
      result[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      result[key] = value.map((v) =>
        v && typeof v === 'object' && !(v instanceof ObjectId) && !(v instanceof Date)
          ? serializeDoc(v)
          : v instanceof ObjectId
            ? v.toString()
            : v instanceof Date
              ? v.toISOString()
              : v,
      );
    } else if (value && typeof value === 'object') {
      result[key] = serializeDoc(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Unserialize client data to MongoDB-ready format
 * Converts string _id -> ObjectId and ISO string -> Date
 */
export function unserializeDoc<T>(doc: T): unknown {
  if (!doc) return null;

  if (Array.isArray(doc)) {
    return doc.map(unserializeDoc);
  }

  const result: Record<string, unknown> = {};
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/i;

  for (const [key, value] of Object.entries(doc as Record<string, unknown>)) {
    if (typeof value === 'string') {
      // Logic for ObjectId (standard hex string length is 24)
      if (value.length === 24 && ObjectId.isValid(value)) {
        result[key] = new ObjectId(value);
      } else if (isoDateRegex.test(value)) {
        result[key] = new Date(value);
      } else {
        result[key] = value;
      }
    } else if (Array.isArray(value)) {
      result[key] = value.map((v) => (v && typeof v === 'object' ? unserializeDoc(v) : v));
    } else if (value && typeof value === 'object') {
      result[key] = unserializeDoc(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
