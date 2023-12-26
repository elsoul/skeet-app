import {
  Firestore,
  DocumentData,
  QueryConstraint,
  query,
  Unsubscribe,
  onSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import { createCollectionRef } from './createCollectionRef'

/**
 * Listens for changes in a Firestore collection based on the provided query constraints.
 *
 * @template T - The type that extends `DocumentData` which the queried documents are expected to conform to.
 * @param {Firestore} db - The Firestore database instance.
 * @param {string} collectionPath - The path to the Firestore collection.
 * @param {QueryConstraint[]} conditions - An array of query constraints to apply.
 * @param {Function} callback - The callback function to be called when the collection changes.
 *
 * @returns {Unsubscribe} - A function that can be called to unsubscribe from the collection changes.
 *
 * @throws Will throw an error if the query could not be executed.
 *
 * @example
 * ```typescript
 * const db: Firestore = getFirestore();
 * const conditions: QueryConstraint[] = [where('age', '>=', 21), orderBy('age')];
 * const unscribe = await onSnapshotCollectionItems<User>(db, 'users', conditions, (snapshot) => {
 *   snapshot.forEach(doc => {
 *     console.log(doc.id, '=>', doc.data());
 *   });
 * });
 * return unscribe;
 */
export const onSnapshotCollectionItems = async <T extends DocumentData>(
  db: Firestore,
  collectionPath: string,
  conditions: QueryConstraint[],
  callback: (snapshot: QueryDocumentSnapshot<T>[]) => void
): Promise<Unsubscribe> => {
  try {
    const collectionRef = createCollectionRef<T>(db, collectionPath)
    const q = query(collectionRef, ...conditions)
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list: QueryDocumentSnapshot<T>[] = []
      querySnapshot.forEach((doc) => {
        list.push(doc)
      });
      callback(list);
    });
    return unsubscribe;
  } catch (error) {
    throw new Error(`Error querying collection: ${error}`)
  }
}
