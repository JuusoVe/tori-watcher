import express = require('express')
import * as dotenv from 'dotenv'
import cors from 'cors'
import { handleSearches, initializeSearches } from './search'

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({
        path: '../.env',
    })
    console.log(process.env)
}

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))

app.post('/execute-searches', async (_req, res) => {
    try {
        console.log('Executing searches')
        await handleSearches()
        res.sendStatus(200)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

app.post('/init-searches', async (_req, res) => {
    try {
        console.log('Initializing searches')
        await initializeSearches()
        res.sendStatus(200)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

app.listen(5001, () => {
    console.log('Server started on port 5001')
})
