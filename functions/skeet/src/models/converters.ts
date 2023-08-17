import { firestore } from 'firebase-admin'
import admin from 'firebase-admin'
// Generic Converter
export const createFirestoreDataConverter = <
  T extends firestore.DocumentData,
>(): firestore.FirestoreDataConverter<T> => {
  return {
    toFirestore(data: T): firestore.DocumentData {
      return data
    },
    fromFirestore(snapshot: firestore.QueryDocumentSnapshot): T {
      return snapshot.data() as T
    },
  }
}

export const createDataRef = <T>(
  db: admin.firestore.Firestore,
  collectionPath: string,
  converter: firestore.FirestoreDataConverter<T>,
) => {
  return db.doc(collectionPath).withConverter(converter)
}

export const getFirestoreData = async <T>(
  dataRef: firestore.DocumentReference<T>,
): Promise<T> => {
  const doc = await dataRef.get()
  if (!doc.exists) {
    throw new Error('Document not found at path: ' + dataRef.path)
  }
  const data = doc.data()
  if (!data) throw new Error('Document data not found at path: ' + dataRef.path)
  return data
}
