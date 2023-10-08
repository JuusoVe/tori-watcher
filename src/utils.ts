export const extractPrice = (itemText: string) => {
    const regex = /(\d+)\s*€/
    const match = regex.exec(itemText)
    if (match !== null) {
        const priceString = match[1]
        const price = parseInt(priceString, 10)
        return price
    }

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
    if (isSendGridError(error)) {
        console.log(error.response.body.errors)
    } else {
        console.error('An unexpected error occurred:', error)
    }
}
