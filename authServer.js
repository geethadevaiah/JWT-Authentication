require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

app.use(express.json())
// from redis cache or database
let refreshTokens = []

// for refreshing the access token
app.post('/token', (req, res) => {
    // get the refresh token set during login
    const refreshToken = req.body.token
    // if there is no refresh token set during login, 401 no content
    if(refreshToken == null) return res.sendStatus(401)
    // in current refresh token is not present in the list
    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    // verify the refresh token and generate the new access token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        const accessToken = generateAccessToken({name: user.name})
        res.json({ accessToken : accessToken })
    })
})

app.delete('/logout', (req, res) => {
    // remove all the refreh token, deauthorize all logins
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

app.post('/login',(req, res) => {
    // Authenticate the user (bcrypt )

    // user object is used in jwt to generate the tokens
    const username = req.body.username
    const user = { name : username }

    // env token are already generated previously and used for the generation of access tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    // push the refresh token to the list
    refreshTokens.push(refreshToken)
    // return both the generated tokens
    res.json({accessToken:accessToken, refreshToken: refreshToken})
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn : '30s'})
}

app.listen(4000)