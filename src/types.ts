export interface ToriSearchTask {
    searchItemKey: string
    maxPrice: number
    searchUrl: string
    reportTo: string[]
    seenItems: string[]
}

export interface ToriItem {
    id: string
    price: number
    url: string
}
