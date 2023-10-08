import { ToriSearchTask } from './types'
export const TORI_ITEM_SELECTOR = 'a.item_row_flex'

export const SEARCHES: ToriSearchTask[] = [
    {
        searchItemKey: 'trippTrappTuoli',
        maxPrice: 100,
        searchUrl:
            'https://www.tori.fi/koko_suomi?q=tripp+trapp+sy%F6tt%F6tuoli&cg=0&w=118',
        reportTo: ['juuso.vesanto@gmail.com'],
        seenItems: [],
    },
]
