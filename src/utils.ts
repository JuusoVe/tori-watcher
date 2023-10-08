import { ToriSearchTask, ToriItem } from './types'

export const reportNewItems = async (
    searchTask: ToriSearchTask,
    newItems: ToriItem[]
) => {
    console.log('Reporting new items', newItems)
}

export const extractPrice = (itemText: string) => {
    const regex = /(\d+)\s*€/
    const match = regex.exec(itemText)
    if (match !== null) {
        const priceString = match[1]
        const price = parseInt(priceString, 10)
        return price
    }

    console.error("Couldn't extract price from", itemText)
    return null
}
