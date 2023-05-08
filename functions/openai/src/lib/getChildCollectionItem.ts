import { get, collection, subcollection, ref } from 'typesaurus'

export const getChildCollectionItem = async <Parent, Child>(
  parentCollectionName: string,
  childCollectionName: string,
  parentId: string,
  childCollectionId: string
): Promise<Child | null> => {
  try {
    const parentCollection = collection<Parent>(parentCollectionName)
    const subCollection = subcollection<Child, Parent>(
      childCollectionName,
      parentCollection
    )
    const parentRef = ref(parentCollection, parentId)
    const subCollectionRef = ref(subCollection(parentRef), childCollectionId)
    const subCollectionDoc = await get(subCollectionRef)
    if (!subCollectionDoc || subCollectionDoc.data === undefined) {
      throw new Error(
        `${childCollectionName} with id ${childCollectionId} not found`
      )
    }
    return {
      id: subCollectionDoc.ref.id,
      ...subCollectionDoc.data,
    } as Child
  } catch (error) {
    throw new Error(`getChildCollectionItem: ${error}`)
  }
}
