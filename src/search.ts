import { Page, chromium } from 'playwright'
import { SEARCHES, TORI_ITEM_SELECTOR } from './constants'
import { ToriSearchTask, ToriItem } from './types'
import { extractPrice, reportNewItems } from './utils'
import { searchTasks } from './db'

export const executeSearch = async (page: Page, search: ToriSearchTask) => {
    await page.goto(search.searchUrl)

    // Wait for the page to load and display the items
    await page.waitForSelector(TORI_ITEM_SELECTOR)

    const searchResultItemsSelector = page.locator(TORI_ITEM_SELECTOR)
    const searchResultItems = await searchResultItemsSelector.all()

    const allCurrentItems = await Promise.all(
        searchResultItems.map(async (item) => {
            const id = await item.getAttribute('id')
            return id
        })
    )

    const newItemIndexes: number[] = []
    const newItemIds: string[] = []

    allCurrentItems.forEach((id, index) => {
        if (id && !search.seenItems.includes(id)) {
            newItemIndexes.push(index)
            newItemIds.push(id)
        }
    })

    // Mark the new items as seen
    await searchTasks.upsert({
        ...search,
        seenItems: [...search.seenItems, ...newItemIds],
    })

    const newItemsWithPrices = await Promise.all(
        newItemIndexes.map(async (index) => {
            const itemText = await searchResultItems[index].innerText()
            const price = extractPrice(itemText)
            return {
                id: newItemIds[index],
                price: price,
                url: await searchResultItems[index].getAttribute('href'),
            }
        })
    )

    const newItemsWithPricesBelowMaxPrice = newItemsWithPrices.filter(
        (item) => item.url && item.price && item.price <= search.maxPrice
    ) as ToriItem[]
    // Finally report the ones that are low enough price
    await reportNewItems(search, newItemsWithPricesBelowMaxPrice)
}

export const handleSearches = async () => {
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()

    const searches = await searchTasks.list()
    console.log('Searches', searches)

    for (const search of searches) {
        await executeSearch(page, search)
    }

    await browser.close()
}

export const initializeSearches = async () => {
    await Promise.all(
        SEARCHES.map(async (search) => {
            const serchExists = await searchTasks.get(search.id)
            if (!serchExists) {
                await searchTasks.add(search)
            }
        })
    )
}
