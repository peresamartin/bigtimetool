window.avgCrackedDrops = window.avgCrackedDrops || 1; // Ensure avgCrackedDrops is globally accessible and defaults to 1
console.log('avgCrackedDrops 0: ', window.avgCrackedDrops)

// DataTables sorting plugin for "HH:MM" time format
$.fn.dataTable.ext.type.order['time-remaining-pre'] = function (data) {
    var matches = data.match(/^(\d+):(\d+)$/);
    if (matches) {
        return parseInt(matches[1], 10) * 60 + parseInt(matches[2], 10);
    } else {
        return parseInt(data.replace('-', ''), 10); // Handle negative times by stripping the '-' and parsing
    }
};
Date.prototype.customFormat = function(formatString){
  var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhhh,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
  YY = ((YYYY=this.getFullYear())+"").slice(-2);
  MM = (M=this.getMonth()+1)<10?('0'+M):M;
  MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
  DD = (D=this.getDate())<10?('0'+D):D;
  DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][this.getDay()]).substring(0,3);
  th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
  formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);
  h=(hhh=this.getHours());
  if (h==0) h=24;
  if (h>12) h-=12;
  hh = h<10?('0'+h):h;
  hhhh = hhh<10?('0'+hhh):hhh;
  AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
  mm=(m=this.getMinutes())<10?('0'+m):m;
  ss=(s=this.getSeconds())<10?('0'+s):s;
  return formatString.replace("#hhhh#",hhhh).replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
};
// Function to calculate time elapsed since lastCrackedHourGlassDropTime
function timeRemainingToReady(dateString, spawnInterval) {
  const lastCrackedDate = new Date(dateString);
  const now = new Date();
  const remaining = lastCrackedDate.getTime() + (spawnInterval * 60 * 60 * 1000) - now.getTime();
  const totalMinutes = Math.floor(Math.abs(remaining) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const sign = remaining < 0 ? '-' : ''; // Add a negative sign for negative time remaining
  return `${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
}
function Pickupdate(dateString, spawnInterval) {
  const lastCrackedDate = new Date(dateString);
  const now = new Date();
  const remaining = lastCrackedDate.getTime() + (spawnInterval * 60 * 60 * 1000);
  var date = new Date(remaining).customFormat( "#YYYY#/#MM#/#DD# #hhhh#:#mm#:#ss#" );
  const totalMinutes = Math.floor(Math.abs(remaining) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const sign = remaining < 0 ? '-' : ''; // Add a negative sign for negative time remaining
  return `${date}`;
}

function calcualte_time()
{
	const field = document.getElementById('calculated');
	const base = document.getElementById('today');
	const Minute  = document.getElementById('Minute');
	const Hour  = document.getElementById('Hour');
	
	//const date = new Date(base.value);
	//console.log(Hour.value);
	var date = moment(base.value).add(Hour.value, 'hours').toDate();
	var date = moment(date).add(Minute.value, 'minutes').toDate();
	//console.log(base.value);
	//console.log(date);
	// Set the date
	date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
	//date.setHours(date.getHours()+Hour);
	field.value = date.toISOString().slice(0,16);
}

function calculateWardensNeeded(totalSpaces, avgCrackedDrops) {
    console.log('avgCrackedDrops 1: ', avgCrackedDrops)
    const chgDismantleRatePerWarden = "TBD";
    const totalChgProduced = "TBD";
    // const chgDismantleRatePerWarden = 10 / (77 / 48); // CHG dismantled by a warden every 48 hours
    // const totalChgProduced = totalSpaces * window.avgCrackedDrops;
    return Math.ceil(totalChgProduced / chgDismantleRatePerWarden);
}

function calculateWardensNeededText(wardensNeeded = 0, timeWardenTotalItems = 0) {
  let wardensNeededText = '';
  wardensNeededText = "" // `You probably need ${wardensNeeded} wardens and have ${timeWardenTotalItems}`;
  return wardensNeededText;
}

// Function to create a table row with three cells
function createRow(item) {
  const { issuedId, archetypeId, lastCrackedHourGlassDropTime, lastEpochDropTime, rarity, size } = item;
  const tr = document.createElement('tr');
  const spawnInterval = item.spawnInterval || 'Unknown';
  tr.dataset.spawnInterval = spawnInterval;
  const tdIssuedId = document.createElement('td');
  const link = document.createElement('a');
  link.href = `https://openloot.com/items/BT0/${archetypeId.replace('BT0_', '')}/issue/${issuedId}`;
  link.textContent = issuedId;
  link.target = '_blank';
  tdIssuedId.appendChild(link);
  const tdTimeElapsed = document.createElement('td');
  const tdPickupDate = document.createElement('td');
  tdPickupDate.textContent = Pickupdate(lastCrackedHourGlassDropTime, parseInt(tr.dataset.spawnInterval));
  const remainingText = timeRemainingToReady(lastCrackedHourGlassDropTime, parseInt(tr.dataset.spawnInterval));
  tdTimeElapsed.textContent = remainingText;
  const tdEpochTimeElapsed = document.createElement('td');
  tdEpochTimeElapsed.textContent = lastEpochDropTime ? timeElapsedSince(lastEpochDropTime) : 'Unknown';
  const tdRarity = document.createElement('td');
  tdRarity.textContent = rarity || 'Unknown';
  const tdSize = document.createElement('td');
  tdSize.textContent = size || 'Unknown';
  const tdSpawnInterval = document.createElement('td');
  tdSpawnInterval.textContent = spawnInterval;
  const checkmark = document.createElement('span');
  checkmark.classList.add('checkmark');
  checkmark.innerHTML = '&#10004;&nbsp;'; // Unicode checkmark symbol with a space
  const [hours, minutes] = remainingText.split(':').map(n => parseInt(n, 10));
  const timeRemaining = hours * 60 + minutes;

  if (tdTimeElapsed.textContent.startsWith('-')) {
    tdIssuedId.prepend(checkmark);
  }

  tr.appendChild(tdIssuedId);
  tr.appendChild(tdPickupDate);
  tr.appendChild(tdTimeElapsed);
  tr.appendChild(tdEpochTimeElapsed);
  tr.appendChild(tdRarity);
  tr.appendChild(tdSize);
  tr.appendChild(tdSpawnInterval);
  return tr;
}

// Function to increment the ready count
function incrementReadyCount() {
  const readyCountElement = document.getElementById('ready-count');
  const nextPickupElement = document.getElementById('next-pickup');
  if (readyCountElement) {
    let minTimeRemaining = Infinity;
    let readyCount = 0;
    let nextPickupCount = 0;
    document.querySelectorAll('tbody tr').forEach(row => {
      const timeRemainingText = row.cells[2].textContent;
      const [hours, minutes] = timeRemainingText.replace('-', '').split(':').map(n => parseInt(n, 10));
      const isNegative = timeRemainingText.startsWith('-');
      const timeRemaining = isNegative ? -(hours * 60 + minutes) : hours * 60 + minutes;
      if (timeRemaining <= 0) {
        readyCount++;
        if (timeRemaining > minTimeRemaining) {
          minTimeRemaining = timeRemaining;
          nextPickupCount = 1;
        } else if (timeRemaining === minTimeRemaining) {
          nextPickupCount++;
        }
      } else if (timeRemaining < minTimeRemaining) {
        minTimeRemaining = timeRemaining;
        nextPickupCount = 1;
      } else if (timeRemaining === minTimeRemaining) {
        nextPickupCount++;
      }
    });

    let nextPickupText = '';
    if (readyCount > 0) {
      nextPickupText = ` ${readyCount} Space${readyCount > 1 ? 's' : ''} Ready`;
    } else if (minTimeRemaining === Infinity) {
      nextPickupText = ' N/A';
    } else {
      const absMinTimeRemaining = Math.abs(minTimeRemaining);
      const minHours = Math.floor(absMinTimeRemaining / 60);
      const minMinutes = Math.floor(absMinTimeRemaining % 60);
      let timeText = '';
      if (minHours > 0) {
        timeText += `${minHours}h `;
      }
      if (minMinutes > 0) {
        timeText += `${minMinutes}m `;
      }
      if (minTimeRemaining < 0) {
        nextPickupText = ` ${nextPickupCount} Space${nextPickupCount > 1 ? 's' : ''} ${timeText} ago`;
      } else {
        nextPickupText = ` ${nextPickupCount} Space${nextPickupCount > 1 ? 's' : ''} in ${timeText}`;
      }
    }

    if (readyCount > 0) {
      readyCountElement.textContent = `Ready: ${readyCount}`;
      readyCountElement.style.display = 'block';
    } else {
      readyCountElement.style.display = 'none';
    }

    nextPickupElement.textContent = nextPickupText;
    if (readyCount > 0) {
      nextPickupElement.classList.add('ready');
      if (!window.nextPickupAlertShown) {
        const notification = new Notification('Cracked Hourglass Timer', {
          body: `${readyCount} Space${readyCount > 1 ? 's' : ''} ready for pickup!`,
          icon: 'static/hourglass.png'
        });
        window.nextPickupAlertShown = true;
      }
    } else {
      nextPickupElement.classList.remove('ready');
    }
  } else {
    console.error('Ready count element not found');
  }
}

// Update the countdown every second
setInterval(incrementReadyCount, 1000);

// Function to build the table and insert it into the popup

function buildTable(spaceData) {
  // Clear the existing table before creating a new one
  const tableContainer = document.getElementById('tableContainer');
  tableContainer.innerHTML = '';
  const table = document.createElement('table');
  table.className = 'display'; // Add the DataTables class name
  table.style.width = '100%'; // Set the table width
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  // Define the headers
  const headers = ['Issued ID','Pickup Date', 'Next pickup', 'Epoch Elapsed', 'Rarity', 'Size', 'Interval'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  // Function to compare elapsed time between two dates
  function compareElapsedTime(a, b) {
    const dateA = new Date(a.lastCrackedHourGlassDropTime);
    const dateB = new Date(b.lastCrackedHourGlassDropTime);
    return dateA - dateB;
  }

  // Calculate the total number of rows
  let totalSpaces;
  chrome.storage.local.get(['userTotalSpaces', 'spaceData'], function(storageData) {
    totalSpaces = storageData.userTotalSpaces || spaceData.length;
    console.log('totalSpaces: ', totalSpaces)
    console.log('storageData: ', storageData)
    document.getElementById('totalSpaces').textContent = `${totalSpaces} Space${totalSpaces > 1 ? 's' : ''}`;
    document.getElementById('totalSpacesInput').value = totalSpaces; // Update the Total Spaces input with the value from storage
  });
  chrome.storage.local.get('timeWardenTotalItems', function(storageData) {
    const timeWardenTotalItems = storageData.timeWardenTotalItems || 0;

    const wardensNeeded = "";
    // const wardensNeeded = calculateWardensNeeded(totalSpaces, window.avgCrackedDrops);
    let wardensNeededText = '';
    // wardensNeededText = `You probably need ${wardensNeeded} wardens and have ${timeWardenTotalItems}`;
    document.getElementById('totalSpaces').textContent = `${totalSpaces} Space${totalSpaces > 1 ? 's' : ''}`;
    document.getElementById('wardensNeeded').textContent = wardensNeededText;
  });

  // Sort the data by elapsed time before creating rows
  updateSpacesWidget(spaceData);

  // Sort the data by Next pickup time before creating rows
  spaceData.forEach(item => {
    const tr = createRow(item);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  // Replace the loading message with the table
  const loadingMessage = document.getElementById('loadingMessage');
  if (loadingMessage) {
    loadingMessage.style.display = 'none';
  }
  tableContainer.appendChild(table); // Append the new table to the container
  // Initialize DataTables with fixed column widths


    $(table).DataTable({
      paging: false,
      info: true,
      searching: true,
      order: [[1, 'asc']],
      scrollY: '50vh',
      scrollCollapse: true,
      columns: [
        { width: '10%' },
		{ width: '10%' },
        { width: '15%', type: 'time-remaining' },
        { width: '15%' },
        { width: '20%' },
        { width: '15%' },
        { width: '15%' }
      ]
    });

  // Update the ready count and next pickup time when building the table
  incrementReadyCount();
}

// Function to update the potential revenue display
function updatePotentialRevenue(spaceData) {
  console.log('avgCrackedDrops: ', avgCrackedDrops)
  // document.getElementById('avgCrackedDropsValue').textContent = window.avgCrackedDrops || 1;
  let totalSpaces = spaceData.length;
  chrome.storage.local.get(['userTotalSpaces', 'timeWardenTotalItems'], function(storageData) {
    totalSpaces = storageData.userTotalSpaces || totalSpaces;
    const timeWardenTotalItems = storageData.timeWardenTotalItems || 0;
    const bigTimePriceElement = document.getElementById('bigTimePriceAmount');
    if (bigTimePriceElement && bigTimePriceElement.textContent) {
      const bigTimePrice = parseFloat(bigTimePriceElement.textContent.replace('$', ''));
      if (!isNaN(bigTimePrice)) {
        const monthlyRevenuePerSpace = (window.avgCrackedDrops/2) * 12 * bigTimePrice * 28;
        const potentialRevenue = totalSpaces * monthlyRevenuePerSpace;
        const potentialRevenueElement = document.getElementById('potentialRevenue');
        if (potentialRevenueElement) {
          potentialRevenueElement.textContent = `Revenue: $${potentialRevenue.toFixed(2)}`;
        }

        const perSpaceRevenueElement = document.getElementById('perSpaceRevenue');
        if (perSpaceRevenueElement) {
          perSpaceRevenueElement.textContent = `Per Space: $${monthlyRevenuePerSpace.toFixed(2)}`;
        }

        const wardensNeeded = calculateWardensNeeded(totalSpaces, window.avgCrackedDrops);
        const wardensNeededText = calculateWardensNeededText(wardensNeeded, timeWardenTotalItems);
        const wardensNeededElement = document.getElementById('wardensNeeded');
        if (wardensNeededElement) {
          wardensNeededElement.textContent = wardensNeededText;
        }

      }

    }

  });
  const bigTimePriceElement = document.getElementById('bigTimePriceAmount');
  if (bigTimePriceElement && bigTimePriceElement.textContent) {
    const bigTimePrice = parseFloat(bigTimePriceElement.textContent.replace('$', ''));
    if (!isNaN(bigTimePrice)) {
      const monthlyRevenuePerSpace = (window.avgCrackedDrops/2) * 12 * bigTimePrice * 28;
      const potentialRevenue = totalSpaces * monthlyRevenuePerSpace;
      const potentialRevenueElement = document.createElement('div');
      potentialRevenueElement.id = 'potentialRevenue';
      potentialRevenueElement.textContent = `Revenue: $${potentialRevenue.toFixed(2)}`;
      const perSpaceRevenueElement = document.createElement('div');
      perSpaceRevenueElement.id = 'perSpaceRevenue';
      perSpaceRevenueElement.textContent = `Per Space: $${monthlyRevenuePerSpace.toFixed(2)}`;
      const perSpaceDetailsElement = document.createElement('div');
      perSpaceDetailsElement.id = 'perSpaceDetails';
      const totalSpacesElement = document.getElementById('totalSpaces');
      if (totalSpacesElement) {
        const existingPotentialRevenueElement = document.getElementById('potentialRevenue');
        if (existingPotentialRevenueElement) {
          existingPotentialRevenueElement.textContent = potentialRevenueElement.textContent;
          const existingPerSpaceRevenueElement = document.getElementById('perSpaceRevenue');
          if (existingPerSpaceRevenueElement) {
            existingPerSpaceRevenueElement.textContent = perSpaceRevenueElement.textContent;
            const existingPerSpaceDetailsElement = document.getElementById('perSpaceDetails');
            if (existingPerSpaceDetailsElement) {
              existingPerSpaceDetailsElement.textContent = perSpaceDetailsElement.textContent;
            } else {
              existingPerSpaceRevenueElement.after(perSpaceDetailsElement);
            }

          } else {
            existingPotentialRevenueElement.after(perSpaceRevenueElement);
            perSpaceRevenueElement.after(perSpaceDetailsElement);
          }

        } else {
          totalSpacesElement.after(potentialRevenueElement);
          potentialRevenueElement.after(perSpaceRevenueElement);
          perSpaceRevenueElement.after(perSpaceDetailsElement);
          const avgCrackedDropsElement = document.createElement('a');
          avgCrackedDropsElement.id = 'avgCrackedDrops';
          avgCrackedDropsElement.href = '#'; // Placeholder href, can be updated to a relevant link if needed
          avgCrackedDropsElement.innerHTML = `Avg Drops: <span class="link-style">${avgCrackedDrops}</span>`;
          perSpaceRevenueElement.after(avgCrackedDropsElement);
        }

      }

    }

  }

}

// Function to prompt for a new average drops value
function promptForAvgCrackedDrops() {
  chrome.storage.local.get(['avgCrackedDrops', 'spaceData'], function(storageData) {
    const currentAvgCrackedDrops = storageData.avgCrackedDrops || 1;
    const newAvgCrackedDrops = prompt('Enter new average drops:', currentAvgCrackedDrops);
    if (newAvgCrackedDrops !== null && !isNaN(parseFloat(newAvgCrackedDrops))) {
      chrome.storage.local.set({'avgCrackedDrops': parseFloat(newAvgCrackedDrops)}, function() {
        console.log('Average drops updated.');
        const avgCrackedDropsElement = document.getElementById('avgCrackedDrops');
        if (avgCrackedDropsElement) {
          avgCrackedDropsElement.innerHTML = `TBD`;
          // avgCrackedDropsElement.innerHTML = `<span class="link-style">${newAvgCrackedDrops}</span> CHG every 48H`;
          avgCrackedDropsElement.querySelector('.link-style').href = '#';
        }
        if (storageData.spaceData) {
          // updatePotentialRevenue(storageData.spaceData, parseFloat(newAvgCrackedDrops));
        }
      });
    }
  });
}

// Function to fetch data from storage and build the table

async function initPopup() {
  try {
    // Ensure fetchData is called and completed in background.js
    chrome.runtime.sendMessage({action: "refreshData", data: "space"}, function(response) {
      if (response.status === 'success') {
        console.log('Data refreshed successfully.');
      } else {
        console.error('Data refresh failed');
      }
    });
    chrome.storage.local.get('spaceData', function(data) {
      if (data.spaceData) {
        buildTable(data.spaceData);
        // updatePotentialRevenue(data.spaceData);
      } else {
        document.getElementById('loadingMessage').textContent = 'No data available.';
      }
    });
    chrome.storage.local.get(['avgCrackedDrops', 'spaceData'], function(data) {
      window.avgCrackedDrops = data.avgCrackedDrops || 1;
      document.getElementById('avgCrackedDropsInput').value = window.avgCrackedDrops;
      if (data.spaceData) {
        // updatePotentialRevenue(data.spaceData);
      }
    });
    const saveAvgCrackedDropsButton = document.getElementById('saveAvgCrackedDrops');
    saveAvgCrackedDropsButton.addEventListener('click', function() {
      const newAvgCrackedDrops = "TBD";
      // const newAvgCrackedDrops = parseFloat(document.getElementById('avgCrackedDropsInput').value);
      chrome.storage.local.set({'avgCrackedDrops': 'TBD'}, function() {
      // chrome.storage.local.set({'avgCrackedDrops': newAvgCrackedDrops}, function() {
        console.log('Average drops updated.');
        chrome.storage.local.get('spaceData', function(storageData) {
            window.avgCrackedDrops = "TBD";
            // window.avgCrackedDrops = newAvgCrackedDrops;
        // updatePotentialRevenue(storageData.spaceData);
        });
      });
    });
  } catch (error) {
    console.error(error);
  }
}

// Function to refresh data and the table when the plugin button is clicked
const refreshDataOnClick = () => {
  chrome.runtime.sendMessage({action: "refreshData"}, function(response) {
    if (response.status === 'success') {
      initPopup();
    }
    console.log(response.status);
  });
}

// Function to update the countdown every second
const updateLeaderboardLink = () => {
  chrome.storage.local.get('leaderboardId', function(data) {
    const leaderboardId = data.leaderboardId;
    const leaderboardLinkElement = document.getElementById('leaderboardLink');
    if (leaderboardId && leaderboardId.trim() !== '') {
      leaderboardLinkElement.innerHTML = `<a href="https://lookerstudio.google.com/s/${leaderboardId}" target="_blank">Leaderboard</a>`;
    } else if (leaderboardId === '' || leaderboardId === null) {
      leaderboardLinkElement.innerHTML = `<a href="https://lookerstudio.google.com/reporting/08c7bf7c-061e-4865-9c9e-9f4dbeb3a904/page/svBoD" target="_blank">Leaderboard</a>`;
    }
  });
}

// Function to prompt for a new target date and time in UTC
const promptForTargetDate = () => {
  const targetDateString = prompt('Please enter the target date in UTC (YYYY-MM-DD):');
  if (targetDateString) {
    const newTargetDate = new Date(targetDateString + 'T23:59:59Z'); // Set time to 23:59:59 to indicate end of day in UTC
    if (!isNaN(newTargetDate.getTime())) {
      chrome.storage.local.set({'targetDate': newTargetDate.toISOString()}, function() {
        updateCountdown();
      });
    } else {
      alert('Invalid date format. Please enter a UTC date in the format YYYY-MM-DDTHH:MM');
    }
  }
};

function updateCountdown() {
  const countdownElement = document.getElementById('countdown');
  const targetDateElement = document.getElementById('targetDateDisplay');
  chrome.storage.local.get('targetDate', function(data) {
    const targetDate = new Date(data.targetDate || '2024-01-11T23:59:59Z');
    const now = new Date();
    const diff = targetDate - now;

    if (data.targetDate && diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const countdownText = `${days}d ${hours}h ${minutes}m`;
      countdownElement.textContent = countdownText;
      const utcYear = targetDate.getUTCFullYear();
      const utcMonth = (targetDate.getUTCMonth() + 1).toString().padStart(2, '0'); // +1 because getUTCMonth() returns 0-11
      const utcDay = targetDate.getUTCDate().toString().padStart(2, '0');
      const utcHours = targetDate.getUTCHours().toString().padStart(2, '0');
      const utcMinutes = targetDate.getUTCMinutes().toString().padStart(2, '0');
      const utcTargetDate = `${utcYear}-${utcMonth}-${utcDay} ${utcHours}:${utcMinutes} UTC`;
      targetDateElement.textContent = `${utcTargetDate}`;
    } else if (data.targetDate) {
      // countdownElement.textContent = 'The countdown has ended.';
    } else {
      // targetDateElement.textContent = 'No date set';
      // countdownElement.textContent = '';
    }
  });
}

// Function to fetch and display the BigTime token price
// {"big-time":{"usd":0.350794,"usd_24h_change":-3.5727493077470402}}
const fetchBigTimePrice = () => {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=big-time&vs_currencies=USD&include_24hr_change=true';
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const price = data['big-time'].usd;
      const priceChange = data['big-time'].usd_24h_change;
      document.getElementById('bigTimePrice').innerHTML = `<a href="https://www.coingecko.com/en/coins/big-time" target="_blank">BIGTIME</a>`;
      document.getElementById('bigTimePriceAmount').textContent = `$${price}`;
      document.getElementById('bigTimePriceChange').textContent = `${priceChange.toFixed(2)}%`;
      const priceChangeDiv = document.createElement('div');
      document.getElementById('bigTimePriceChange').style.color = priceChange >= 0 ? 'green' : 'red';
    })
    .catch(error => {
      console.error('Error fetching BigTime price:', error);
      document.getElementById('bigTimePrice').textContent = 'BIGTIME: Error fetching price';
    });
}
const fetchOpenlootPrice = () => {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=open-loot&vs_currencies=USD&include_24hr_change=true';
  fetch(url)
    .then(response => response.json())
    .then(data => {
	  const price = data['open-loot'].usd;
      const priceChange = data['open-loot'].usd_24h_change;
 	  document.getElementById('openLootPrice').innerHTML = `<a href="https://www.coingecko.com/en/coins/open-loot" target="_blank">$OL</a>`;
	  document.getElementById('openLootPriceAmount').textContent = `$${price}`;
      document.getElementById('openLootPriceChange').textContent = `${priceChange.toFixed(2)}%`;
      const priceChangeDiv = document.createElement('div');
      document.getElementById('openLootPriceChange').style.color = priceChange >= 0 ? 'green' : 'red';
    })
    .catch(error => {
      console.error('Error fetching OpenLoot price:', error);
      document.getElementById('openLootPrice').textContent = 'Openloot: Error fetching price';
    });
}

// Function to update the UTC clock every second
const updateUTCClock = () => {
  const utcClockElement = document.getElementById('utcClock');
  
  if (utcClockElement) {
    const now = new Date();
    const utcYear = now.getUTCFullYear();
    const utcMonth = (now.getUTCMonth() + 1).toString().padStart(2, '0'); // +1 because getUTCMonth() returns 0-11
    const utcDay = now.getUTCDate().toString().padStart(2, '0');
    const utcHours = now.getUTCHours().toString().padStart(2, '0');
    const utcMinutes = now.getUTCMinutes().toString().padStart(2, '0');
    const utcSeconds = now.getUTCSeconds().toString().padStart(2, '0');
    const utcTime = `${utcYear}-${utcMonth}-${utcDay} ${utcHours}:${utcMinutes}:${utcSeconds} UTC`;
    utcClockElement.textContent = utcTime;
  }
};

const updateNow = () => {
	const field = document.getElementById('today');
  const date = new Date();
  // Set the date
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
	field.value = date.toISOString().slice(0,16);
};




// Initialize the UTC clock update interval
window.addEventListener('load', () => {
  setInterval(updateUTCClock, 1000); // Update the UTC clock every second
  setInterval(updateNow, 300000); // Update the UTC clock every second
  
  // Add event listener for the address copy links
  document.querySelectorAll('.copy-address').forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const addressType = link.dataset.addressType;
      const address = link.dataset.address;
      navigator.clipboard.writeText(address).then(function() {
        // Show flash message instead of alert
        showFlashMessage(`${addressType} address copied!`);
      }, function(err) {
        console.error(`Could not copy ${addressType} address: `, err);
      });
    });
  });

  // Add event listener to close the config panel when clicking outside
  window.addEventListener('click', function(event) {
    const configPanel = document.getElementById('configPanel');
    if (configPanel.style.width === '250px') {
      closeConfigPanel();
    }
  });
});

// Function to toggle the configuration panel
function toggleConfigPanel() {
  const configPanel = document.getElementById('configPanel');
  const configPanelContent = document.getElementById('configPanelContent');
  // Check if the panel is currently open or closed by checking the width
  const isPanelOpen = configPanel.style.width === '250px';
  // Set the width and opacity based on the current state
  configPanel.style.width = isPanelOpen ? '0' : '250px';
  configPanelContent.style.opacity = isPanelOpen ? 0 : 1;
}

// Function to close the configuration panel
function closeConfigPanel() {
  const configPanel = document.getElementById('configPanel');
  configPanel.style.width = '0';
  setTimeout(() => {
    configPanelContent.style.opacity = 0;
  }, 300); // Start fading out slightly before the panel finishes collapsing
}

// Function to open a tab
function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tab-button");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block"; // Ensure the tab content is displayed
  evt.currentTarget.className += " active";
}

// Function to initialize tab event listeners
function initTabEventListeners() {
  console.log('initTabEventListeners')
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      console.log('tabButtons click listener')
      const tabName = button.getAttribute('data-tab-target');
      openTab(event, tabName);
      if (tabName === 'Spaces') {
        console.log('Spaces Tab clicked');
        const table = $('#spacesTable').DataTable();
        table.on('draw.dt', function () {
          console.log('Table redrawn');
        });
        table.draw();
      }
    });
  });
}

function initButtonEventListeners() {
  console.log('initButtonEventListeners')
  const tabButtons = document.querySelectorAll('.time-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      console.log('Buttons click listener')
      calcualte_time();
    });
  });
}

// Initialize the popup when it is opened
document.addEventListener('DOMContentLoaded', () => {
  initTabEventListeners(); // Initialize tab event listeners
  initButtonEventListeners();
  fetchBigTimePrice(); // Fetch and display the BigTime token price
  fetchOpenlootPrice();
  initPopup(); // Initialize the popup without refreshing data
  updateLeaderboardLink(); // Update the leaderboard link
  addEventListeners(); // Add event listeners for buttons and inputs
  updateCountdown(); // Update the countdown after a 1 second delay
  setInterval(updateCountdown, 60000); // Update the countdown every minute
  updateUTCClock(); // Update the UTC clock
  updateNow();
  // Set the default tab open (if you want to show the first tab content by default)
  document.querySelector('.tab-button').click();
  document.querySelector('.time-button').click();
});

// Removed duplicate function declaration
function setInputValuesToCurrentSettings() {
  chrome.storage.local.get(['leaderboardId', 'targetDate', 'avgCrackedDrops', 'userTotalSpaces'], function(data) {
    const leaderboardIdInput = document.getElementById('leaderboardIdInput');
    const countdownDateInput = document.getElementById('countdownDateInput');
    const avgCrackedDropsInput = document.getElementById('avgCrackedDropsInput');
    const totalSpacesInput = document.getElementById('totalSpacesInput');

    if (leaderboardIdInput && data.leaderboardId !== undefined) {
      leaderboardIdInput.value = data.leaderboardId;
    }

    if (countdownDateInput && data.targetDate !== undefined) {
      const targetDate = new Date(data.targetDate);
      countdownDateInput.value = targetDate.toISOString().split('T')[0]; // Set the date part
    }

    if (avgCrackedDropsInput && data.avgCrackedDrops !== undefined) {
      // document.getElementById('avgCrackedDropsValue').textContent = data.avgCrackedDrops || 1;
      avgCrackedDropsInput.value = data.avgCrackedDrops;
    }

    if (totalSpacesInput && data.userTotalSpaces !== undefined) {
      totalSpacesInput.value = data.userTotalSpaces;
    } else if (totalSpacesInput) {
      totalSpacesInput.value = '';
    }

    // Update the Total Spaces input with the value from storage
    document.getElementById('totalSpaces').textContent = `Spaces:${data.userTotalSpaces || 0}`;

  });
}

// Function to refresh data and initialize the popup
function refreshDataAndInitPopup() {
  clearNextPickupData();

  chrome.runtime.sendMessage({action: "refreshData"}, function(response) {
    if (response.status === 'success') {
      initPopup();
    } else {
      console.error('Error refreshing data:', response.status);
    }
  });
}

// Function to clear the 'Next pickup' and 'Ready' data
function clearNextPickupData() {
  const nextPickupElement = document.getElementById('next-pickup');
  const readyCountElement = document.getElementById('ready-count');
  if (nextPickupElement) nextPickupElement.textContent = 'Next pickup: ...';
  if (readyCountElement) readyCountElement.textContent = 'Ready: ...';
}

// Function to add event listeners for buttons and inputs
function addEventListeners() {
  chrome.storage.local.get('avgCrackedDrops', function(data) {
    window.avgCrackedDrops = data.avgCrackedDrops || 1;
    // document.getElementById('avgCrackedDropsValue').textContent = window.avgCrackedDrops;
  });

  // const saveLeaderboardIdButton = document.getElementById('saveLeaderboardId');
  // if (saveLeaderboardIdButton) {
  //   saveLeaderboardIdButton.addEventListener('click', function() {
  //     const leaderboardId = document.getElementById('leaderboardIdInput').value;
  //     chrome.storage.local.set({'leaderboardId': leaderboardId.trim()}, function() {
  //       updateLeaderboardLink();
  //     });
  //   });
  // }

  // const saveCountdownDateButton = document.getElementById('saveCountdownDate');
  // if (saveCountdownDateButton) {
  //   saveCountdownDateButton.addEventListener('click', function() {
  //     const targetDateString = document.getElementById('countdownDateInput').value;
  //     const newTargetDate = new Date(targetDateString + 'T23:59:59Z');
  //     if (!isNaN(newTargetDate.getTime())) {
  //       chrome.storage.local.set({'targetDate': newTargetDate.toISOString()}, function() {
  //         updateCountdown();
  //       });
  //     } else {
  //       alert('Invalid date format. Please enter a UTC date in the format YYYY-MM-DD');
  //     }
  //   });
  // }

  // const saveTotalSpacesButton = document.getElementById('saveTotalSpaces');
  // if (saveTotalSpacesButton) {
  //   saveTotalSpacesButton.addEventListener('click', function() {
  //     const totalSpaces = parseInt(document.getElementById('totalSpacesInput').value, 10);
  //     chrome.storage.local.set({'userTotalSpaces': totalSpaces}, function() {
  //       console.log('Total spaces updated.');
  //       // Update the displayed total spaces immediately
  //       document.getElementById('totalSpaces').textContent = `${totalSpaces} Space${totalSpaces > 1 ? 's' : ''}`;
  //       // Update the potential revenue and wardens needed display
  //       chrome.storage.local.get(['spaceData', 'avgCrackedDrops', 'timeWardenTotalItems'], function(storageData) {
  //         // updatePotentialRevenue(storageData.spaceData, storageData.avgCrackedDrops);
  //       });
  //     });
  //   });
  // }

  // const resetTotalSpacesButton = document.getElementById('resetTotalSpaces');
  // if (resetTotalSpacesButton) {
  //   resetTotalSpacesButton.addEventListener('click', function() {
  //     document.getElementById('totalSpacesInput').value = '';
  //     chrome.storage.local.remove('userTotalSpaces', function() {
  //       console.log('Total spaces input reset.');
  //       // Recalculate and update the UI to reflect the reset
  //       chrome.storage.local.get(['spaceData', 'avgCrackedDrops'], function(storageData) {
  //         const spaceData = storageData.spaceData || [];
  //         const avgCrackedDrops = storageData.avgCrackedDrops || 1;
  //         // updatePotentialRevenue(spaceData, avgCrackedDrops);
  //         document.getElementById('totalSpaces').textContent = `Spaces:${spaceData.length}`;
  //         const wardensNeeded = calculateWardensNeeded(spaceData.length);
  //         chrome.storage.local.get('timeWardenTotalItems', function(data) {
  //           const timeWardenTotalItems = data.timeWardenTotalItems || 0;
  //           const wardensNeededText = calculateWardensNeededText(wardensNeeded, timeWardenTotalItems);
  //           document.getElementById('wardensNeeded').textContent = wardensNeededText;
  //         });
  //       });
  //     });
  //   });
  // }

  // const helpButton = document.getElementById('helpButton');

  const headingElement = document.getElementById('heading');
  if (headingElement) {
    headingElement.addEventListener('click', refreshDataAndInitPopup);
  }

  // const saveAvgCrackedDropsButton = document.getElementById('saveAvgCrackedDrops');
  // if (saveAvgCrackedDropsButton) {
  //   saveAvgCrackedDropsButton.addEventListener('click', function() {
  //     const newAvgCrackedDrops = parseFloat(document.getElementById('avgCrackedDropsInput').value);
  //     chrome.storage.local.set({'avgCrackedDrops': newAvgCrackedDrops}, function() {
  //       console.log('Average drops updated.');
  //       chrome.storage.local.get('spaceData', function(storageData) {
  //         window.avgCrackedDrops = newAvgCrackedDrops;
  //         // updatePotentialRevenue(storageData.spaceData);
  //       });
  //     });
  //   });
  // }

  // Prevent clicks within the config panel from closing it
  // const configPanelInputs = document.querySelectorAll('#configPanel input');
  // configPanelInputs.forEach(input => {
  //   input.addEventListener('click', function(event) {
  //     event.stopPropagation();
  //   });
  // });

  setInputValuesToCurrentSettings(); // Set the input values to the current settings
}
// Function to show a flash message
function showFlashMessage(message) {
  const flashMessageContainer = document.getElementById('flashMessageContainer');
  if (flashMessageContainer) {
    flashMessageContainer.textContent = message;
    flashMessageContainer.style.opacity = 1;
    setTimeout(() => {
      flashMessageContainer.style.opacity = 0;
    }, 3000); // Message disappears after 3 seconds
  }
}
// Function to calculate elapsed time since lastEpochDropTime
function timeElapsedSince(dateString) {
  const lastEpochDate = new Date(dateString);
  const now = new Date();
  const elapsed = now.getTime() - lastEpochDate.getTime();
  const totalMinutes = Math.floor(Math.abs(elapsed) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
// Function to update the spacesWidget with counts of each space rarity and size
function updateSpacesWidget(spaceData) {
  const raritySizeCounts = spaceData.reduce((counts, space) => {
    const key = `${space.rarity} ${space.size}`;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

  const spacesCount = document.getElementById('spaces-count');
  const list = document.createElement('ul');
  Object.entries(raritySizeCounts).forEach(([key, count]) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${count} ${key}`;
    list.appendChild(listItem);
  });

  // Clear previous counts and add new list
  spacesCount.innerHTML = '';
  spacesCount.appendChild(list);
}
