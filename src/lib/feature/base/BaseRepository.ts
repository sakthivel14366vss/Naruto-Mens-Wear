import {
  type Db,
  type Collection,
  type Document,
  ObjectId,
  type WithId,
  type Filter,
  type UpdateFilter, // Added this
} from 'mongodb';

export default abstract class BaseRepository<T extends Document> {
  protected collection: Collection<T>;

  constructor(db: Db, collectionName: string) {
    this.collection = db.collection<T>(collectionName);
  }

  toObjectId(id: string | ObjectId): ObjectId | null {
    if (id instanceof ObjectId) return id;
    if (!ObjectId.isValid(id) || (typeof id === 'string' && id.length !== 24)) return null;
    return new ObjectId(id);
  }

  async findById(id: string | ObjectId): Promise<WithId<T> | null> {
    const objId = this.toObjectId(id);
    if (!objId) return null;
    const filter = { _id: objId } as unknown as Filter<T>;
    return await this.collection.findOne(filter);
  }

  /**
   * Updates specific fields of a document by ID.
   * @param id - String or ObjectId
   * @param updates - An object containing the fields to update (Partial<T>)
   */
  async updateFieldsById(id: string | ObjectId, updates: Partial<T>): Promise<WithId<T> | null> {
    const objId = this.toObjectId(id);
    if (!objId) return null;
    const filter = { _id: objId } as unknown as Filter<T>;
    // 1. Apply the update using $set so we don't overwrite the whole document
    const result = await this.collection.updateOne(filter, { $set: updates } as UpdateFilter<T>);
    // 2. Return the newly updated document (or null if not found)
    if (result.matchedCount === 0) return null;
    return await this.collection.findOne(filter);
  }
}
