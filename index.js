const bodyParser = require('body-parser')
const express = require('express')
const FitbitApiClient = require('fitbit-node')
const fs = require('fs')

require('dotenv').config()

const PORT_HTTP = process.env.PORT_HTTP
const CALLBACK_URL = process.env.CALLBACK_URL


const client = new FitbitApiClient({
    clientId: process.env.FITBIT_CLIENT_ID,
    clientSecret: process.env.FITBIT_CLIENT_SECRET
})

const app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.listen(PORT_HTTP, () => console.log('Server listening on port', PORT_HTTP))


app.get('/', (req, res) => {
    res.redirect(getCode())
})

app.get('/callback', (req, res) => {
    client.getAccessToken(req.query.code, CALLBACK_URL).then(function (result) {
        // use the access token to fetch the user's profile information
        fs.writeFileSync(__dirname + '/token.txt', JSON.stringify(result))
        res.redirect('/ok')
    }).catch(function (error) {
        res.send(error)
    })
})


app.get('/ok', (req, res) => {
    res.send('Token saved successful. Verify on file token.txt on project directory.')
})


// Functions
function getCode() {
    try {
        return client.getAuthorizeUrl('activity heartrate profile sleep weight', CALLBACK_URL)
    } catch (err) {
        console.log('err is', err)
    }
}
