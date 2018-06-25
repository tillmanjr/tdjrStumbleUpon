const listsJson = require('./server/data/raw/StumbleUponLists.json')
const likesJson = require('./server/data/raw/StumbleUponLikes.json')
const likesPhotosJson = require('./server/data/raw/StumbleUponLikesPhotos.json')
const likesVideosJson = require('./server/data/raw/StumbleUponLikesVideos.json')
const axios = require('axios')

const myUserID = 3700706;

const parseKeys = (list) => {
  const listKeys = Object.keys(list);
  console.log(listKeys)
  return listKeys
}


// synchronous wrapper fetching a file from a URL
function getJson(url) {
  return axios.get(url)
    .then(response => {
      return response.data
    })
    .catch(error => console.log(error))
}

// extracts all the StumbleUpon likes from JSON returned from Stumbleupon
const getLikes = (jsonObj, listType, listID, listName) => {
  const likesSection = jsonObj.likes.values;
  if (likesSection) {
    console.log(`Likes found: ${likesSection.length}`)
    const result = []
    likesSection.forEach((like) => {
      result.push({
        listType,
        listID,
        listName,
        'itemTitle': like.title,
        'itemUrl': like.url
      })
    })
    if (result.length > 0) {
      console.log("results:", JSON.stringify(result))
    }
  } else {
    console.log("no likes section")
  }
}

// gets all the Stumbleupon lists (id, name, url, filename to save as) from StumbleUpon
const getLists = () => {
  const listsSection = listsJson.lists.values;
  const result = []
  if (listsSection) {
    listsSection.forEach((list) => {
      result.push({
        'id': list.id,
        'name': list.name,
        'itemsUrl': `https://www.stumbleupon.com/api/v2_0/user/${myUserID}/lists/${list.id}/items`, // incorrect
        'itemFilename': `StumbleUponListItems_${list.name.replace(' ', '_')}.json`
      })
    })
  }
  return result
}


// gets all the lists from StumbleUpon then calls Stumbleupoon to get each list's entries
function getAllListItems() {
  const lists = getLists()
  let itemCount = 0
  let expectedItemCount = 0
  console.log(`Lists found: ${lists.length}`)
  if (lists.length > 0) {
    var result = []
    lists.forEach((list) => {
      const listName = list.name
      const listID = list.id
      const listUrl = `https://www.stumbleupon.com/api/v2_0/list/${listID}/items?offset=0&userid=${myUserID}&listId=${listID}`
      getJson(listUrl)
        .then((items, result) => {
          const allItemsSection = items.items.values;          
          const resultItems = []
 
          if (allItemsSection) {
            allItemsSection.forEach((item) => {
              itemCount++
              const extracted = {
                listType: 'Lists',
                listID,
                listName,
                itemTitle: item.url.title,
                itemUrl: item.url.url
              }
              resultItems.push(extracted)
            })
          }
          console.log( JSON.stringify( resultItems ) )
        });
    });
  }
}

getAllListItems()
// getLikes(likesJson, 'Likes', 'Pages', 'Liked Pages')
// getLikes(likesPhotosJson, 'Likes', 'Photos', 'Liked Photos')
// getLikes(likesVideosJson, 'Likes', 'Videos', 'Liked Videos')