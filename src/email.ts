import sgMail from '@sendgrid/mail'
import { ToriSearchTask, ToriItem } from './types'
import { logError } from './utils'

const SENDER = 'juuso.vesanto@gmail.com'
const RECIPIENTS = ['juuso.vesanto@gmail.com', 'supietila@gmail.com']

export const reportNewItems = async (
    searchTask: ToriSearchTask,
    newItems: ToriItem[]
) => {
    console.log('Reporting new items', newItems)
    if (!process.env.SENDGRID_API_KEY) {
        console.error('No SendGrid API key found')
        return
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    const msg = {
        from: SENDER, // Change to your verified sender
        subject: 'New Tori.fi items found for search ' + searchTask.id,
        text:
            'New Items: ' +
            newItems
                .map((item) => `Price: ${item.price} Link: ${item.url}`)
                .join(', '),
        html: `<h1>New Items:</h1><br/><br/>
        ${newItems
            .map((item) => `<p>Price: ${item.price} <br/>Link: ${item.url}</p>`)
            .join('')}
        
        `,
    }

    const messages = RECIPIENTS.map((recipient) => ({
        ...msg,
        to: recipient,
    }))

    await Promise.all(
        messages.map((message) => {
            try {
                return sgMail.send(message)
            } catch (error: unknown) {
                logError(error)
            }
        })
    )
}
