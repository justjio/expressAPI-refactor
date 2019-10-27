//Import dependencies
var express = require('express'),
    monk = require('monk'),
    logger = require('morgan') //Body parser not needed as it's now embedded in express

//Express app
var app = express()

//use inbuilt bodyparser for data and parameter retrieval
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(logger())

//Connection to MongoDB using Monk
var url = 'mongodb://127.0.0.1:27017/test',
    db = monk(url)

//Convert id hex strings to MongoDB ObjectID
// var id = monk.id

//A middleware for automatically selecting a needed collection
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.get(collectionName);
    return next()
})

//Configuration of routes begin
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collections/messages')
}) //Just a helper home route
app.get('/collections/:collectionName', (req, res, next) => {
    req.collection.find({}, {
        limit: 10,
        sort: [['_id',-1]]
    }, (e, results) => {
        if (e) return next(e)
        res.send(results)
    })
}) //Retrieve a list of docs sorted by _id that has a limit of 10
app.post('/collections/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, {}, (e, results) => {
        if (e) return next(e)
        res.send(results)
    })
}) //Insert a doc into a collection - free JSON advantage here!
app.get('/collections/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: req.params.id}, (e, result) => {
        if (e) return next(e)
        res.send(result)
    })
}) //Retrieve onl one document by ID
app.put('/collections/:collectionName/:id', (req, res, next) => {
    req.collection.update({_id: req.params.id},
    {$set: req.body},
    {safe: true,
    multi: false},
    (e, result) => {
        if (e) return next(e)
        res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
    })
}) //Update one document
app.delete('/collections/:collectionName/:id', (req, res, next) => {
    req.collection.remove({_id: req.params.id}, (e, result) => {
        if (e) return next(e)
        res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
    })
})


//Listen for server start
app.listen(3000, () => {
    console.log('Server is running!')
})