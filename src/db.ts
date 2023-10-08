import {
    CollectionReference,
    DocumentReference,
    FieldValue,
    PartialWithFieldValue,
    UpdateData,
    WhereFilterOp,
} from 'firebase-admin/firestore'
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import firebaseAdmin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import { ToriSearchTask } from './types'

interface WithId {
    id: string
}

interface Filter<T> {
    field: keyof T
    opStr: WhereFilterOp
    value: unknown
}
const credentialFile = './.service-account-credentials.json'

const isCloudRun = process.env.K_SERVICE !== undefined
const admin = initializeApp({
    credential: isCloudRun
        ? applicationDefault()
        : firebaseAdmin.credential.cert(credentialFile),
    projectId: process.env.FIREBASE_PROJECT_ID,
})

const adminDB = getFirestore(admin)

/**
 *
 * Creates a controller object for the collection, with typed operations as properties
 *
 * About typings:
 * T represents the full object with id included
 * To keep typescript intelligence, use Omit<T, "id"> to represent the entity without id.
 * All Document and Collection references therefore use Omit<T, "id"> and entity return should be T.
 *
 * @param collectionName
 * @returns
 *
 * @ref https://googleapis.dev/nodejs/firestore/latest/Firestore.html
 */
const createCollectionController = <T extends WithId>(
    collectionName: string,
    dbToUse: FirebaseFirestore.Firestore
) => {
    const db = dbToUse ?? adminDB
    const getCollection = () =>
        db.collection(collectionName) as CollectionReference<Omit<T, 'id'>>

    return {
        /**
         * Fetch a document by id
         * @param id
         */
        get: async (id: T['id']) => {
            const docRef = db.doc(
                `${collectionName}/${id}`
            ) as DocumentReference<Omit<T, 'id'>>
            const document = await docRef.get()
            if (document.exists)
                return { id: document.id, ...document.data() } as T
            return null
        },

        /**
         * Create a new document. Use upsert method if you want to force the id.
         * @param data Omit<T, "id">
         * @returns database created id
         */
        add: async (data: Omit<T, 'id'>): Promise<T['id']> => {
            const collection = getCollection()
            const document = await collection.add(data)
            return document.id
        },

        /**
         * Update an existing document or create a new with the provided id if one doesn't already exist.
         * Only updates fields, doesn't remove other existing fields.
         * @param document Partial<T> with id mandatory.
         */
        upsert: async (document: PartialWithFieldValue<T>): Promise<void> => {
            const { id, ...data } = document
            const docRef = db.doc(
                `${collectionName}/${id}`
            ) as DocumentReference<Omit<T, 'id'>>
            await docRef.set(data as PartialWithFieldValue<Omit<T, 'id'>>, {
                merge: true,
            })
        },

        /**
         * Delete a single field from a record
         * @param id string
         * @param field keyof T
         */
        deleteField: async (id: T['id'], field: keyof T): Promise<void> => {
            const docRef = db.doc(
                `${collectionName}/${id}`
            ) as DocumentReference<Omit<T, 'id'>>
            await docRef.update({ [field]: FieldValue.delete() } as UpdateData<
                Omit<T, 'id'>
            >)
        },

        /**
         * Permanently delete an entire document. Use deleteField to delete a single field only.
         * @param id
         */
        delete: async (id: T['id']): Promise<void> => {
            const docRef = db.doc(
                `${collectionName}/${id}`
            ) as DocumentReference<Omit<T, 'id'>>
            await docRef.delete()
        },

        /**
         * List all documents
         * @returns T[]
         */
        list: async (): Promise<T[]> => {
            const collection = getCollection()
            const snapshot = await collection.get()
            const mappedDocuments = snapshot.docs.map((document) => {
                const { id } = document
                const data = document.data()
                return { id, ...data } as T
            })
            return mappedDocuments
        },

        /**
         * @param filters any amount of Filter<T> comma separated
         * @returns  T[]
         */
        listFiltered: async (...filters: Filter<T>[]): Promise<T[]> => {
            const collection = getCollection()
            const [firstFilter, ...rest] = filters

            let query: FirebaseFirestore.Query<Omit<T, 'id'>> =
                collection.where(
                    firstFilter.field as string,
                    firstFilter.opStr,
                    firstFilter.value
                )

            if (rest.length) {
                rest.forEach((filter) => {
                    const { field, opStr, value } = filter
                    query = query.where(field as string, opStr, value)
                })
            }

            const snapshot = await query.get()
            const mappedDocuments = snapshot.docs.map((document) => {
                const { id } = document
                const data = document.data()
                return { id, ...data } as T
            })
            return mappedDocuments
        },
    }
}

export const createClients = (dbToUse?: FirebaseFirestore.Firestore) => {
    const db = dbToUse ?? adminDB
    return {
        searchTasks: createCollectionController<ToriSearchTask>('searches', db),
    }
}

const { searchTasks } = createClients()

export { searchTasks }
