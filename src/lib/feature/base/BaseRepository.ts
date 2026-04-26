// src/lib/feature/base/BaseRepository.ts
import type { Db, Collection, Document } from 'mongodb';

export default abstract class BaseRepository<T extends Document> {
  protected db: Db;
  protected collection: Collection<T>;
  protected collectionName: string;

  constructor(db: Db, collectionName: string) {
    this.db = db;
    this.collection = db.collection<T>(collectionName);
    this.collectionName = collectionName;
  }
}
