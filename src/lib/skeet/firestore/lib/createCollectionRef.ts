import { createFirestoreDataConverter } from './createFirestoreDataConverter'
import {
  DocumentData,
  collection,
  Firestore,
  CollectionReference,
} from 'firebase/firestore'

export const createCollectionRef = <T extends DocumentData>(
  db: Firestore,
  collectionPath: string
): CollectionReference<T> => {
  return collection(db, collectionPath).withConverter(
    createFirestoreDataConverter<T>()
  )
}
