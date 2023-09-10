import {
  Firestore,
  DocumentData,
  QueryConstraint,
  query,
  getDocs,
  QuerySnapshot,
} from 'firebase/firestore'
import { createCollectionRef } from './createCollectionRef'

/**
 * Asynchronously queries a Firestore collection based on the provided query constraints.
 *
 * @template T - The type that extends `DocumentData` which the queried documents are expected to conform to.
 * @param {Firestore} db - The Firestore database instance.
 * @param {string} collectionPath - The path to the Firestore collection.
 * @param {QueryConstraint[]} conditions - An array of query constraints to apply.
 *
 * @returns {Promise<QuerySnapshot<T>>} - A promise that resolves to a QuerySnapshot containing the queried documents.
 *
 * @throws Will throw an error if the query could not be executed.
 *
 * @example
 * ```typescript
 * const db: Firestore = getFirestore();
 * const conditions: QueryConstraint[] = [where('age', '>=', 21), orderBy('age')];
 * const snapshot = await queryCollectionItems<User>(db, 'users', conditions);
 * snapshot.forEach(doc => {
 *   console.log(doc.id, '=>', doc.data());
 * });
 * ```
 */

export const queryCollectionItems = async <T extends DocumentData>(
  db: Firestore,
  collectionPath: string,
  conditions: QueryConstraint[]
): Promise<QuerySnapshot<T>> => {
  try {
    const collectionRef = createCollectionRef<T>(db, collectionPath)

    const q = query(collectionRef, ...conditions)

    const snapshot = await getDocs(q)
    return snapshot
  } catch (error) {
    throw new Error(`Error querying collection: ${error}`)
  }
}
