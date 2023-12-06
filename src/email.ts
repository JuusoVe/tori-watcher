import sgMail from '@sendgrid/mail'
import { ToriSearchTask, ToriItem } from './types'
import { logError } from './utils'

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

    const emailMessage = {
        from: SENDER, // Change to your verified sender
        subject: 'New Tori.fi items found for search ' + searchTask.id,
        to: RECIPIENT,
        cc: CC,
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

    try {
        await sgMail.send(emailMessage)
    } catch (error: unknown) {
        logError(error)
    }
}
