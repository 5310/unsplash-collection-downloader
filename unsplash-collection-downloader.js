#!/usr/bin/env node

global.fetch = require('node-fetch')
const minimist = require('minimist')
const toJson = require('unsplash-js').toJson
const Unsplash = require('unsplash-js').default
const mkdirp = require('mkdirp-promise')
const download = require('images-downloader').images
const run = require('./run.js')

const unsplash = new Unsplash({
  applicationId: 'fc2fe1886ec75a7031e7bce0204c58afe32bb5c223d0370e7d583cf12e18fc1f',
  secret: '849159e85df060e38b80e54eb14d15d4880bbb1d619e1237a2fda7c38a17efd4',
})

const collection = async (id, width, height) => {
  let photos = [], page, i = 1
  do {
    page = (await unsplash.collections.getCollectionPhotos(id, i, 30).then(toJson))
      .map(photo => photo.urls.raw)
      .map(photo => width && height ? `${photo}&fit=crop&crop=entropy&w=${width}&h=${height}` : photo)
    i++
    photos = photos.concat(page)
  } while (page.length)
  return photos
}

run(async () => {
  const {_: [id, output], w, h, help} = minimist(process.argv.slice(2), {string: '_'})
  if (help || !id) {
    console.log(`
Usage: unsplash-collection-downloader [-w width, -h height, --help] collection-id [download-dir]

A collection-id is required. Unsplash collection URLs take the following form: 
https://unsplash.com/collections/<collection-id>/<collection-name>

If no download-dir is given, the files are downloaded in a child directory the 
same name as the collection-id under the present directory.  

Options:
  -w            width to crop the downloaded images to
  -h            height to crop the downloaded images to
  --help        this information
`.slice(1, -1)
    )
    return 
  } 
  const photos = await collection(id, w, h)
  await mkdirp(output || id)
  download(photos, output || id)
})