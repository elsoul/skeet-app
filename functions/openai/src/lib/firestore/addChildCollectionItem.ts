import { add, collection, get, set, subcollection } from 'typesaurus'
import { getTimestamp } from '@/utils/time'

export const addChildCollectionItem = async <Child, Parent>(
  parentCollectionName: string,
  childCollectionName: string,
  parentId: string,
  params: Child,
  id?: string
) => {
  try {
    const parentCollection = collection<Parent>(parentCollectionName)
    const mainCollection = subcollection<Child, Parent>(
      childCollectionName,
      parentCollection
    )

    const body = mainCollection(parentId)
    const datetimeNow = await getTimestamp()
    const data = {
      ...params,
      createdAt: datetimeNow,
      updatedAt: datetimeNow,
    }

    if (!id) {
      return await add(body, data)
    } else {
      const collectionId = id || '1'
      await set(body, collectionId, data)
      const collectionRef = await get(body, collectionId)
      if (!collectionRef) throw new Error('collectionRef is undefined')
      return collectionRef.ref
    }
  } catch (error) {
    throw new Error(`addSubcollectionItem: ${error}`)
  }
}