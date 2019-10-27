//Dependencies
const express = require('express'),
    monk = require('monk'),
    url = 'mongodb://127.0.0.1:27017/test',
    db = monk(url)

const app = express() //Express app
//Using dependencies ...
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//Getting collection from params
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.get(collectionName)
    return next()
})

//Configuring routes
//Default route
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collections/messages')
})
//GET 1 collection
app.get('/collections/:collectionName', async (req, res, next) => {
    try {
        const results = await req.collection.find()
        res.send(results)
    }
    catch (e) {
        return next(e)
    }
})
//POST an object
app.post('/collections/:collectionName', async (req, res, next) => {
    try {
        const doc = await req.collection.insert([req.body])
        res.send(doc)
    }
    catch (e) {
        return next(e)
    }
})
//GET one object
app.get('/collections/:collectionName/:id', async (req, res, next) => {
    try {
        const oneUser = await req.collection.findOne({_id: req.params.id})
        res.send(oneUser)
    }
    catch (e) {
        return next(e)
    }
})
//Update an object
app.put('/collections/:collectionName/:id', async (req, res, next) => {
    try {
        const updatedUser = await req.collection.update({_id: req.params.id},
                {$set: req.body})
        res.send({msg: 'success'})
    }
    catch (e) {
        res.send({msg: 'error'})
    }
})
//Delete an object
app.delete('/collections/:collectionName/:id', async (req, res, next) => {
    try {
        const deletedOne = await req.collection.remove({_id: req.params.id})
        res.send({msg: 'success'})
    }
    catch (e) {
        res.send({msg: 'error'})
    }
})


//Start server
app.listen(3000, () => {
    console.log('Server is up and running!!!')
})