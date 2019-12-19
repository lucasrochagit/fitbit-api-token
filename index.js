const bodyParser = require('body-parser')
const express = require('express')
const FitbitApiClient = require('fitbit-node')
const fs = require('fs')

require('dotenv').config()

const PORT = process.env.PORT
const CALLBACK_URL = process.env.CALLBACK_URL
const app = express()
const client = new FitbitApiClient({
    clientId: process.env.FITBIT_CLIENT_ID,
    clientSecret: process.env.FITBIT_CLIENT_SECRET
})

function getCode() {
    try {
        return client.getAuthorizeUrl('activity heartrate profile sleep weight', CALLBACK_URL)
    } catch (err) {
        console.log('err is', err)
    }
}

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.listen(PORT, () => console.log('Server listening on port', PORT))


app.get('/', (req, res) => {
    res.redirect(getCode())
})

app.get('/callback', (req, res) => {
    console.log('query', req.query, 'body', req.body)
    client.getAccessToken(req.query.code, CALLBACK_URL).then(function (result) {
        // use the access token to fetch the user's profile information
        fs.writeFileSync(__dirname + '/token.txt', result)
        res.redirect('/ok')
    }).catch(function (error) {
        res.send(error)
    })
})


app.get('/ok', (req, res) => {
    console.log('query', req.query, 'body', req.body)
    res.send('code ok')
})

