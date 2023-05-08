import { add, collection, subcollection } from 'typesaurus'
import { getTimestamp } from '@/utils/time'

export const addGrandChildCollectionItem = async <GrandChild, Child, Parent>(
  parentCollectionName: string,
  childCollectionName: string,
  grandChildCollectionName: string,
  parentId: string,
  childId: string,
  params: GrandChild
) => {
  try {
    const parentCollection = collection<Parent>(parentCollectionName)
    const childCollection = subcollection<Child, Parent>(
      childCollectionName,
      parentCollection
    )
    const grandChildCollection = subcollection<GrandChild, Child>(
      grandChildCollectionName,
      childCollection(parentId)
    )

    const body = grandChildCollection(childId)
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
