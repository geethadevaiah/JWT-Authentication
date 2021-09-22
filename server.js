require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

app.use(express.json())

// list of posts 
const posts = [
    {
        username : "jamie",
        title : "post 1"
    }, {
        username : "joshua",
        title : "post 2"
    }
]

// get the list of posts for specific username
app.get('/posts', authenticateToken , (req, res) => {
    res.json(posts.filter(post => post.username == req.user.name))
})

// authenticateToken is the middleware used to verify the tokens
function authenticateToken(req, res, next){
    // get the token from the auth header
    const authHeader = req.headers['authorization']
    // authorization is in the form {{ BEARER token }}
    const token = authHeader && authHeader.split(' ')[1] // get the secont split in the array
    if(token == null) return res.sendStatus(401) // if not token present
    // verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

app.listen(3000)