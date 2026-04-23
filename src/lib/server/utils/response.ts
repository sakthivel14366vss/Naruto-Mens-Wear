// src/lib/server/utils/response.ts

import type { InsertOneResult, UpdateResult, DeleteResult, WithId, Document } from 'mongodb';

// Define a union type for all possible Mongo mutation results
type MongoResult<T> =
  | InsertOneResult<Document>
  | UpdateResult<Document>
  | DeleteResult
  | WithId<T>
  | null;

/**
 * Standardized response format for mutations (Create, Update, Delete)
 */
interface MutationResponse {
  success: boolean;
  message: string;
  id?: string;
}

export default class AppError extends Error {
  public isOperational: boolean;
  constructor(
    public message: string = 'Internal AppError Occurred',
    public statusCode: number = 400,
  ) {
    super(message);
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Processes MongoDB results.
 * Returns MutationResponse for writes, or the Document itself for reads.
 */
export function handleDBResult<T>(
  result: MongoResult<T>,
  entityName: string = 'Data',
): MutationResponse | WithId<T> {
  // 1. Handle Null/Undefined (Common in findOne)
  if (!result) {
    throw new AppError(`${entityName} not found`, 404);
  }

  // 2. Handle Insert Result (insertOne)
  if ('insertedId' in result) {
    return {
      success: true,
      message: `${entityName} created successfully`,
      id: result.insertedId.toString(),
    };
  }

  // 3. Handle Update Result (updateOne/updateMany)
  if ('matchedCount' in result) {
    if (result.matchedCount === 0) {
      throw new AppError(`${entityName} not found to update`, 404);
    }
    return {
      success: true,
      message:
        result.modifiedCount > 0
          ? `${entityName} updated successfully`
          : `No changes made to ${entityName}`,
    };
  }

  // 4. Handle Delete Result (deleteOne/deleteMany)
  if ('deletedCount' in result) {
    if (result.deletedCount === 0) {
      throw new AppError(`${entityName} not found to delete`, 404);
    }
    return {
      success: true,
      message: `${entityName} deleted successfully`,
    };
  }

  // 5. If it reaches here, it's a found document (WithId<T>)
  return result;
}
