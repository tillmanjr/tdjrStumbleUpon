var express = require('express')
var fs = require("fs");
var app = express()
const util = require('util')

const JSON_LIST_ALL = './server/data/extracted/StumbleUponListsAll.json';
const JSON_LIKES_PAGES = './server/data/extracted/StumbleUponLikesPages.json';
const JSON_LIKES_PHOTOS = './server/data/extracted/StumbleUponLikesPhotos.json';
const JSON_LIKES_VIDEOS = './server/data/extracted/StumbleUponLikesVideos.json';

/*
  this is a bonehead node server to get around Chrome's refusal to load local files
*/

// needed for CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// wrapper to make async endpoints easier
const asyncHandler = fn => (req, res, next) =>
  Promise
  .resolve(fn(req, res, next))
  .catch(next);

// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile);

// gets a file from the filesystem
async function getFile(filename) {
  return readFile(filename)
}

// returns a promise containing all the async file reads
async function getAllFiles() {
  return Promise.all( 
    [
      getFile(JSON_LIST_ALL),
      getFile(JSON_LIKES_PAGES),
      getFile(JSON_LIKES_PHOTOS),
      getFile(JSON_LIKES_VIDEOS),
    ]
  )
}

// loads all the files from the filesystem, then returns them as combined JSON
async function getAll() {
  const files = await getAllFiles()
  return new Promise( (resolve, reject) => {
    try {
      const result = []
      files.forEach( (file) => {
        const fileData = JSON.parse(file)
        fileData.forEach( (item) => { 
          result.push(item)
        })
      })
      resolve( JSON.stringify(result) )
    } catch (err) {
      reject(err)
    }
  })
}

// endpoint - is the server alive
app.get('/', function (req, res) {
  res.send('server is alive')
})

// endpoint - return all the combined JSON files
app.get('/all', asyncHandler((req, res, next) => {
  const result = getAll()
    .then((result) => {
      res.status(200).send(result)
    })
    .catch( (err) => {
      res.status(503).json({error: err.message})
      next
    })
}));

// endpoint - return the list entries
app.get('/lists', asyncHandler((req, res, next) => {
  const result = getFile(JSON_LIST_ALL)
  .then((result) => {
    res.status(200).send(result)
  })
  .catch( (err) => {
    res.status(503).json({error: err.message})
    next
  })
}));

// endpoint - return the Photo Likes
app.get('/likes/photos', asyncHandler((req, res, next) => {
  try {
    const result = getFile(JSON_LIKES_PHOTOS)
      .then((result) => {
        res.status(200).send(result)
      })
  } catch (err) {
    return res.status(503).json({
      error: err.message
    })
  }
}));

// endpoint - return the Video Likes
app.get('/likes/videos', asyncHandler((req, res, next) => {
  try {
    const result = getFile(JSON_LIKES_VIDEOS)
      .then((result) => {
        res.status(200).send(result)
      })
  } catch (err) {
    return res.status(503).json({
      error: err.message
    })
  }
}));

// endpoint - return the Webpage Likes
app.get('/likes', asyncHandler((req, res, next) => {
  try {
    const result = getFile(JSON_LIKES_PAGES)
      .then((result) => {
        res.status(200).send(result)
      })
  } catch (err) {
    return res.status(503).json({
      error: err.message
    })
  }
}));

// twiddle thumbs and wait
app.listen(3000, function () {
  console.log("App listening on port 3000!");
});