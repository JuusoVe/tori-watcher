import { ToriSearchTask, ToriItem } from './types'

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

type SendGridError = {
    code: number
    response: {
        headers: Record<string, string>
        body: { errors: unknown[] }
    }
}

const isSendGridError = (error: unknown): error is SendGridError => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'response' in error &&
        typeof (error as SendGridError).response.body === 'object' &&
        Array.isArray((error as SendGridError).response.body.errors)
    )
}

export const logError = (error: unknown) => {
    if (error instanceof Error) {
        // If error is an instance of the built-in Error class:
        console.log(error.message)
    } else if (isSendGridError(error)) {
        // If error is a SendGridError:
        console.log(error.response.body.errors)
    } else {
        // Otherwise:
        console.error('An unexpected error occurred:', error)
    }
}
