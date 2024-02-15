import { DocumentData, Firestore, Unsubscribe, getDoc, onSnapshot } from 'firebase/firestore'
import { createDocRef } from './createDocRef'

/**
 * Subscribes to changes in a specific document within a collection in Firestore.
 * 
 * @param db - The Firestore instance.
 * @param collectionPath - The path to the collection.
 * @param docId - The ID of the document.
 * @param callback - The callback function to be called when the document changes.
 * @returns An unsubscribe function that can be used to stop listening to changes.
 * @throws Error if the document is not found at the specified path.
 * @example
 * ```typescript
 * const db: Firestore = getFirestore();
 * const unscribe = await onSnapshotCollectionItem<User>(db, 'users', 'user123', (doc) => {
 *   console.log(doc);
 * });
 * return unscribe;
 */
export const onSnapshotCollectionItem = async <T extends DocumentData>(
  db: Firestore,
  collectionPath: string,
  docId: string,
  callback: (data: T) => void
): Promise<Unsubscribe> => {
  const dataRef = createDocRef<T>(db, collectionPath, docId)
  const docSnap = await getDoc(dataRef)
  if (!docSnap.exists()) {
    throw new Error('Document not found at path: ' + dataRef.path)
  }
  const unsubscribe = onSnapshot(dataRef, (docSnap) => {
    const data = { id: docSnap.id, ...docSnap.data() }
    if (!data) throw new Error('Document data not found at path: ' + dataRef.path)
    callback(data as unknown as T)
  })
  return unsubscribe
}
