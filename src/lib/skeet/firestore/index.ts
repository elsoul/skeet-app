export {
  createDocRef,
  createFirestoreDataConverter,
  getCollectionItem as get,
  addCollectionItem as add,
  createCollectionRef,
  addMultipleCollectionItems as adds,
  queryCollectionItems as query,
  updateCollectionItem as update,
  deleteCollectionItem as remove,
  onSnapshotCollectionItem as onSnapshot,
  onSnapshotCollectionItems as onSnapshotQuery,
} from './lib'

export { serverTimestamp } from 'firebase/firestore'
