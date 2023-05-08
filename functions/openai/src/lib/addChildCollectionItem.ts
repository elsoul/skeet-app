import { add, collection, subcollection } from 'typesaurus'
import { getTimestamp } from '@/utils/time'

export const addChildCollectionItem = async <Child, Parent>(
  parentCollectionName: string,
  childCollectionName: string,
  parentId: string,
  params: Child
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
    const res = await add(body, data)
    return res
  } catch (error) {
    throw new Error(`addSubcollectionItem: ${error}`)
  }
}
