// Function to fetch data from the API and store it
function fetchData(page = 1, allSpaceData = []) {
  const url = `https://api.openloot.com/v2/market/items/in-game?gameId=56a149cf-f146-487a-8a1c-58dc9ff3a15c&page=${page}&pageSize=500&tags=space`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const items = data.items || [];
      const spaceData = allSpaceData.concat(items.map(item => {
        const issuedId = item.issuedId;
        const metadata = item.metadata || {};
        const archetypeId = metadata.archetypeId || null;
        const rarity = metadata.tags ? metadata.tags.find(tag => ['rare', 'epic', 'legendary', 'mythic', 'exalted'].includes(tag.toLowerCase())) : 'unknown';
        const size = metadata.tags ? metadata.tags.find(tag => ['small', 'medium', 'large'].includes(tag.toLowerCase())) : 'unknown';
        const spawnInterval = determineSpawnInterval(rarity, size);
        let lastCrackedHourGlassDropTime = null;
        let lastEpochDropTime = null;
        if (item.extra && item.extra.attributes) {
          const lastCrackedAttribute = item.extra.attributes.find(attr => attr.name === 'LastCrackedHourGlassDropTime');
          lastCrackedHourGlassDropTime = lastCrackedAttribute ? lastCrackedAttribute.value : null;

          const lastEpochAttribute = item.extra.attributes.find(attr => attr.name === 'LastEpochDropTime');
          lastEpochDropTime = lastEpochAttribute ? lastEpochAttribute.value : null;
        }
        return { issuedId, archetypeId, lastCrackedHourGlassDropTime, lastEpochDropTime, rarity, size, spawnInterval };
      })).filter(item => item.lastCrackedHourGlassDropTime !== null);

      if (data.currentPage < data.totalPages) {
        fetchData(page + 1, spaceData);
      } else {
        // Store the combined data using Chrome's storage API
        chrome.storage.local.set({ 'spaceData': spaceData }, function() {
          console.log('Hourglass data is stored.');
          console.log('spaceData:', spaceData);
        });
      }
    })
    .catch(error => console.error('Error fetching data:', error));
}

// Function to determine spawnInterval based on rarity and size
function determineSpawnInterval(rarity, size) {
  const intervals = {
    'rare': { 'small': 72, 'medium': 66, 'large': 60 },
    'epic': { 'small': 66, 'medium': 60, 'large': 54 },
    'legendary': { 'small': 60, 'medium': 54, 'large': 48 },
    'mythic': { 'small': 54, 'medium': 48, 'large': 42 },
    'exalted': { 'small': 48, 'medium': 42, 'large': 36 },
  };
  const normalizedRarity = rarity ? rarity.toLowerCase() : 'unknown';
  const normalizedSize = size ? size.toLowerCase() : 'unknown';
  return intervals[normalizedRarity] && intervals[normalizedRarity][normalizedSize] ?
         intervals[normalizedRarity][normalizedSize] : null;
}

// Function to fetch total TimeWarden items from the API and store it
function fetchTimeWardenTotalItems() {
  const url = 'https://api.openloot.com/v2/market/items/in-game?gameId=56a149cf-f146-487a-8a1c-58dc9ff3a15c&nftTags=NFT.Workshop.TimeWarden&page=1&pageSize=500&sort=name%3Aasc';

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const totalItems = data.totalItems || 0;

      // Store the total number of TimeWarden items using Chrome's storage API
      chrome.storage.local.set({ 'timeWardenTotalItems': totalItems }, function() {
        console.log('TimeWarden total items is stored.');
      });
    })
    .catch(error => console.error('Error fetching TimeWarden total items:', error));
}

function fetchPremiumCurrencies(){
}

// Call fetchData when the background script loads and when a refresh message is received
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "refreshData") {
    if (request.data === "space") {
      fetchData();
    } else if (request.data === "timeWarden") {
      //fetchTimeWardenTotalItems();
    }
    sendResponse({status: 'success'});
  }
});

fetchData();
//fetchTimeWardenTotalItems();

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
      url: chrome.runtime.getURL('popup.html')
  });
});
