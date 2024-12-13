// popup.js
//
// This script is responsible for fetching and displaying currency data within the extension's popup interface.
// It performs the following actions:
// 1. Fetches the current USD price of "big-time" currency from the CoinGecko API.
// 2. Fetches a list of premium currencies from the OpenLoot API.
// 3. For each currency, fetches detailed statistics including the lowest price per stack.
// 4. Special handling is applied to Time Crystals to set a fixed price.
// 5. The fetched data is then used to populate a table in the popup with currency details.
// 6. The currencies are sorted by their USD price before being displayed.
// 7. For each currency, the script calculates the refine cost based on the current price of "big-time" and other item prices.
// 8. The DOMContentLoaded event is used to trigger the data fetching and processing when the popup is opened.
//
// Variable to store the current USD price of "big-time" currency
console.log('Premium Currencies')

let bigTimePriceUSD;
const TIME_CRYSTALS_PRICE = 49999;

// Event listener that triggers the data fetching and processing when the popup is opened
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input[type=checkbox]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.id !== 'all' && this.checked) {
                document.getElementById('all').checked = false;
            }
            if (this.id === 'all' && this.checked) {
                document.querySelectorAll('input[type=checkbox]:not(#all)').forEach(otherCheckbox => {
                    otherCheckbox.checked = false;
                });
            }
            displayTableFromLocalStorage();
            const checkboxStates = {};
            document.querySelectorAll('input[type=checkbox]').forEach(checkbox => {
                checkboxStates[checkbox.id] = checkbox.checked;
            });
            localStorage.setItem('checkboxState', JSON.stringify(checkboxStates));
        });
        const checkboxStates = JSON.parse(localStorage.getItem('checkboxState'));
        if (checkboxStates && checkboxStates[checkbox.id] !== undefined) {
            checkbox.checked = checkboxStates[checkbox.id];
        }
    });

    // Fetch the price of "big-time" from CoinGecko API
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=big-time&vs_currencies=USD')
        .then(response => response.json())
        .then(priceData => {
            bigTimePriceUSD = priceData['big-time'].usd;
            localStorage.setItem('bigTimePriceUSD', bigTimePriceUSD);
        })
        .catch(error => console.error('Error fetching big-time price:', error));
		
	fetch('https://api.coingecko.com/api/v3/simple/price?ids=open-loot&vs_currencies=USD')
        .then(response => response.json())
        .then(priceData => {
            OLPriceUSD = priceData['open-loot'].usd;
            localStorage.setItem('OLPriceUSD', OLPriceUSD);
        })
        .catch(error => console.error('Error fetching big-time price:', error));

});
// Function to save the fetched currency data to local storage
function saveTableDataToLocalStorage(data) {
    // Parse any existing table data from local storage or initialize an empty array if none exists
    let tableData = JSON.parse(localStorage.getItem('tableData')) || [];
    // Calculate the refine cost based on the purchase prices of the items
    let refineCostBasedOnPurchasePrices = calculateRefineCostBasedOnPurchase(data, bigTimePriceUSD);
    // Calculate the refine cost based on the purchase prices of the items
    let refineCostBasedOnPurchase = calculateRefineCostBasedOnPurchase(data, bigTimePriceUSD);
    // Determine the price per individual item based on the lowest price per stack
    let pricePerItem;
    if (data.id === 'a98b86d8-ed8f-4e50-a223-e3a19191445b') { // Time Crystals
        pricePerItem = data.lowestPricePerStack / 70000;
    } else {
        pricePerItem = data.lowestPricePerStack / data.stackSize;
    }
    // Construct a new data object with all the relevant currency information
    let newData = {
        id: data.id,
        name: data.name,
        lowestPricePerStack: data.lowestPricePerStack,
        totalCurrencyForSale: data.totalCurrencyForSale,
        icon: data.icon,
        stackSize: data.stackSize,
        status: data.status,
        sellable: data.sellable,
        tradeable: data.tradeable,
        maxStacksPerPurchase: data.maxStacksPerPurchase,
        maxSellPricePerStack: data.maxSellPricePerStack,
        maxStacksUserCanListForSell: data.maxStacksUserCanListForSell,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lowestPrices: data.lowestPrices,
        pricePerItem: pricePerItem,
        refineCostBasedOnPurchasePrices: refineCostBasedOnPurchasePrices,
        // Calculate the difference between the lowest price per stack and the refine cost
        priceMinusRefineCost: data.lowestPricePerStack - refineCostBasedOnPurchasePrices.cost
    };
    // Update the existing data in local storage if it exists, otherwise push the new data object
    const existingDataIndex = tableData.findIndex(item => item.id === newData.id);
    if (existingDataIndex !== -1) {
        tableData[existingDataIndex] = newData;
    } else {
        tableData.push(newData);
    }
    // Save the updated table data back to local storage
    localStorage.setItem('tableData', JSON.stringify(tableData));
}

// Function to display the currency data from local storage in the table
function displayTableFromLocalStorage() {
    calculateAndDisplayCraftingCosts();
    const tableBody = document.getElementById('currency-table').getElementsByTagName('tbody')[0];
    let data = JSON.parse(localStorage.getItem('tableData'));
    // Add header for the new Action column if it doesn't exist
    const headerRow = document.getElementById('currency-table').getElementsByTagName('thead')[0].rows[0];
    if (!document.getElementById('action-header')) {
        let actionHeader = document.createElement('th');
        actionHeader.id = 'action-header';
        actionHeader.textContent = 'Action';
        headerRow.appendChild(actionHeader);
    }

    tableBody.innerHTML = ''; // Clear the table body before inserting new rows
    if (data) {
        const selectedTypes = Array.from(document.querySelectorAll('input[type=checkbox]:checked')).map(checkbox => checkbox.name);
        if (selectedTypes.includes('all') || selectedTypes.includes('bigtime')) {
            addBigTimePriceRow(JSON.parse(localStorage.getItem('bigTimePriceUSD')));
        }
        if (!selectedTypes.includes('all')) {
            data = data.filter(itemData => {
                if (selectedTypes.includes('crystals') && itemData.name.includes('Crystals')) {
                    return true;
                }
                if (selectedTypes.includes('terra') && itemData.name.includes('Terra')) {
                    return true;
                }
                if (selectedTypes.includes('blushfire') && itemData.name.includes('Blushfire')) {
                    return true;
                }
                return false;
            });
        }
        // Define the custom order for the items
        const sortOrder = [
            'Raw Terra Core',
            'Augmented Terra Core',
            'Infused Terra Core',
            'Saturated Terra Core',
            'Raw Blushfire Lattice',
            'Augmented Blushfire Lattice',
            'Infused Blushfire Lattice',
            'Saturated Blushfire Lattice',
            'Big Time',
            'Time Crystals'
        ];
        // Sort the data array according to the specified order
        data.sort((a, b) => sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name));
        data.forEach(itemData => {
            let row = tableBody.insertRow();
            let qtyCell = row.insertCell();
            if (itemData.id === 'a98b86d8-ed8f-4e50-a223-e3a19191445b') { // Time Crystals
                qtyCell.textContent = '70000';
            } else {
                qtyCell.textContent = itemData.stackSize;
            }
            let nameCell = row.insertCell();
            nameCell.textContent = itemData.name;
            let priceCell = row.insertCell();
            priceCell.textContent = `$${(itemData.lowestPricePerStack / 100).toFixed(2)}`;
            let pricePerItemCell = row.insertCell();
            pricePerItemCell.textContent = `$${(itemData.pricePerItem / 100).toFixed(4)}`;
            let refineCostCell = row.insertCell();
            refineCostCell.textContent = itemData.refineCostBasedOnPurchasePrices.formattedCost;
            let actionCell = row.insertCell();
            // Determine the action based on the comparison of purchase price and refine cost
            if (itemData.refineCostBasedOnPurchasePrices.cost !== null) {
                if (itemData.lowestPricePerStack < itemData.refineCostBasedOnPurchasePrices.cost) {
                    let buyLink = document.createElement('a');
                    buyLink.href = `https://openloot.com/wallet/premium-currencies/marketplace/${itemData.id}?tab=buy`;
                    buyLink.textContent = 'Buy';
                    buyLink.target = '_blank'; // Ensure the link opens in a new tab
                    actionCell.appendChild(buyLink);
                } else {
                    let buyLink = document.createElement('a');
                    buyLink.href = `https://openloot.com/wallet/premium-currencies/marketplace/${itemData.id}?tab=buy`;
                    buyLink.textContent = 'Refine';
                    buyLink.target = '_blank'; // Ensure the link opens in a new tab
                    actionCell.appendChild(buyLink);
                    // actionCell.textContent = 'Refine';
                }
            } else {
                actionCell.textContent = ''; // Ensure the cell is created even if there is no action
            }
        });
}
}

// Function to calculate the refine cost based on the current price of "big-time" and other item prices
function calculateRefineCostBasedOnPurchase(itemData, bigTimePriceUSD) {
    // Retrieve the table data from local storage or initialize an empty array if none exists
    const tableData = JSON.parse(localStorage.getItem('tableData')) || [];
    // Create a mapping of item names to their lowest price per stack
    const itemPrices = tableData.reduce((acc, curr) => {
        acc[curr.name] = curr.pricePerItem;
        return acc;
    }, {});

    // Populate itemPrices with actual data...
    // Define the refine cost for each item based on the price of "big-time" and the prices of other items
    // 'Augmented Terra Core': (30 * bigTimePriceUSD) + 75 * (itemPrices['Raw Terra Core'] || 0),
    // 'Infused Terra Core': (90 * bigTimePriceUSD + 75) * (itemPrices['Augmented Terra Core'] || 0),
    const refineCostBasedOnPurchasePrices = {
        'Augmented Terra Core': (30 * (bigTimePriceUSD * 100)) + (75 * itemPrices['Raw Terra Core'] || 0),
        'Infused Terra Core': (90 * (bigTimePriceUSD * 100)) + (75 * itemPrices['Augmented Terra Core'] || 0),
        'Saturated Terra Core': (270 * (bigTimePriceUSD * 100)) + (75 * itemPrices['Infused Terra Core'] || 0),
        'Augmented Blushfire Lattice': (30 * (bigTimePriceUSD * 100)) + (75 * itemPrices['Raw Blushfire Lattice'] || 0),
        'Infused Blushfire Lattice': (90 * (bigTimePriceUSD * 100)) + (75 * itemPrices['Augmented Blushfire Lattice'] || 0),
        'Saturated Blushfire Lattice': (270 * (bigTimePriceUSD * 100)) + (75 * itemPrices['Infused Blushfire Lattice'] || 0)
    };

    // Calculate the total cost for refining the item based on the prices of the required materials
    let cost = refineCostBasedOnPurchasePrices[itemData.name] || null;
    // Return the cost and a formatted string representation of the cost, or 'N/A' if the cost is not applicable
    return cost !== null ? { cost: cost, formattedCost: `$${(cost / 100).toFixed(4)}` } : { cost: null, formattedCost: 'N/A' };
}

function addBigTimePriceRow(bigTimePriceUSD) {
    const tableBody = document.getElementById('currency-table').getElementsByTagName('tbody')[0];
    if (!document.getElementById('BIGTIME')) {
        let row = tableBody.insertRow();
        row.id = 'BIGTIME';
        let qtyCell = row.insertCell();
        qtyCell.textContent = '1';
        let nameCell = row.insertCell();
        nameCell.textContent = 'Big Time';
        let priceCell = row.insertCell();
        priceCell.textContent = `$${bigTimePriceUSD.toFixed(4)}`;
        let pricePerItemCell = row.insertCell();
        pricePerItemCell.textContent = `$${bigTimePriceUSD.toFixed(4)}`;
        let refineCostCell = row.insertCell();
        refineCostCell.textContent = 'N/A';
        let actionCell = row.insertCell();
        actionCell.textContent = ''; // Ensure the cell is created even if there is no action
    }
}

function calculateAndDisplayCraftingCosts() {
    const tableData = JSON.parse(localStorage.getItem('tableData')) || [];
    const itemPrices = tableData.reduce((acc, curr) => {
        acc[curr.name] = curr.pricePerItem;
        return acc;
    }, {});
    let craftingCosts = {
        'Common': {
            'Armory': 50 * (bigTimePriceUSD * 100) + 25 * (itemPrices['Augmented Terra Core'] || 0),
            'Forge': 50 * (bigTimePriceUSD * 100) + 25 * (itemPrices['Augmented Blushfire Lattice'] || 0),
            'Warden': 250 * (itemPrices['Time Crystals'] || 0) + 12 * (itemPrices['Augmented Terra Core'] || 0) + 12 * (itemPrices['Augmented Blushfire Lattice'] || 0)
        },
        'UnCommon': {
            'Armory': 100 * (bigTimePriceUSD * 100) + 50 * (itemPrices['Augmented Terra Core'] || 0),
            'Forge': 100 * (bigTimePriceUSD * 100) + 50 * (itemPrices['Augmented Blushfire Lattice'] || 0),
            'Warden': 500 * (itemPrices['Time Crystals'] || 0) + 24 * (itemPrices['Augmented Terra Core'] || 0) + 24 * (itemPrices['Augmented Blushfire Lattice'] || 0)
        },
        'Rare': {
            'Armory': 200 * (bigTimePriceUSD * 100) + 100 * (itemPrices['Augmented Terra Core'] || 0),
            'Forge': 200 * (bigTimePriceUSD * 100) + 100 * (itemPrices['Augmented Blushfire Lattice'] || 0),
            'Warden': 1000 * (itemPrices['Time Crystals'] || 0) + 48 * (itemPrices['Augmented Terra Core'] || 0) + 48 * (itemPrices['Augmented Blushfire Lattice'] || 0)
        },
        'Epic': {
            'Armory': 300 * (bigTimePriceUSD * 100) + 25 * (itemPrices['Infused Terra Core'] || 0),
            'Forge': 300 * (bigTimePriceUSD * 100) + 25 * (itemPrices['Infused Blushfire Lattice'] || 0),
            'Warden': 1500 * (itemPrices['Time Crystals'] || 0) + 12 * (itemPrices['Infused Terra Core'] || 0) + 12 * (itemPrices['Infused Blushfire Lattice'] || 0)
        },
        'Legendary': {
            'Armory': 500 * (bigTimePriceUSD * 100) + 50 * (itemPrices['Infused Terra Core'] || 0),
            'Forge': 500 * (bigTimePriceUSD * 100) + 50 * (itemPrices['Infused Blushfire Lattice'] || 0),
            'Warden': 2500 * (itemPrices['Time Crystals'] || 0) + 24 * (itemPrices['Infused Terra Core'] || 0) + 24 * (itemPrices['Infused Blushfire Lattice'] || 0)
        },
        'Mythic': {
            'Armory': 1000 * (bigTimePriceUSD * 100) + 100 * (itemPrices['Infused Terra Core'] || 0),
            'Forge': 1000 * (bigTimePriceUSD * 100) + 100 * (itemPrices['Infused Blushfire Lattice'] || 0),
            'Warden': 5000 * (itemPrices['Time Crystals'] || 0) + 48 * (itemPrices['Infused Terra Core'] || 0) + 48 * (itemPrices['Infused Blushfire Lattice'] || 0)
        },
        'Exalted': {
            'Armory': 2000 * (bigTimePriceUSD * 100) + 25 * (itemPrices['Saturated Terra Core'] || 0),
            'Forge': 2000 * (bigTimePriceUSD * 100) + 25 * (itemPrices['Saturated Blushfire Lattice'] || 0),
            'Warden': 10000 * (itemPrices['Time Crystals'] || 0) + 12 * (itemPrices['Saturated Terra Core'] || 0) + 12 * (itemPrices['Saturated Blushfire Lattice'] || 0)
        },
        'Exotic': {
            'Armory': 5000 * (bigTimePriceUSD * 100) + 50 * (itemPrices['Saturated Terra Core'] || 0),
            'Forge': 5000 * (bigTimePriceUSD * 100) + 50 * (itemPrices['Saturated Blushfire Lattice'] || 0),
            'Warden': 25000 * (itemPrices['Time Crystals'] || 0) + 24 * (itemPrices['Saturated Terra Core'] || 0) + 24 * (itemPrices['Saturated Blushfire Lattice'] || 0)
        },
        'Transcendant': {
            'Armory': 15000 * (bigTimePriceUSD * 100) + 100 * (itemPrices['Saturated Terra Core'] || 0),
            'Forge': 15000 * (bigTimePriceUSD * 100) + 100 * (itemPrices['Saturated Blushfire Lattice'] || 0),
            'Warden': '' // No Warden cost for Transcendant
        },
        'Unique': {
            'Armory': 30000 * (bigTimePriceUSD * 100) + 200 * (itemPrices['Saturated Terra Core'] || 0),
            'Forge': 30000 * (bigTimePriceUSD * 100) + 200 * (itemPrices['Saturated Blushfire Lattice'] || 0),
            'Warden': '' // No Warden cost for Unique
        }
        // Add similar calculations for other rarities...
    };
    // Calculate new values based on the provided formula
    let previousTotalCosts = {
        'Armory': 0,
        'Forge': 0,
        'Warden': 0
    };
    Object.keys(craftingCosts).forEach((rarity, index) => {
        Object.keys(craftingCosts[rarity]).forEach(location => {
            let craftCost = craftingCosts[rarity][location];
            let burnCost = 0;
            // Apply burn cost calculation based on the previous row's total cost, except for the first row (Common)
            // Apply burn cost calculation based on the previous row's total cost for the same location
            if (index !== 0 && previousTotalCosts[location] !== undefined) {
                burnCost = previousTotalCosts[location] * 3;
            }
            let totalCost = craftCost + burnCost;
            // Update the previous total cost for the next iteration
            // Update the previous total cost for the next iteration for the same location
            previousTotalCosts[location] = totalCost;
            craftingCosts[rarity][location] = { craftCost, burnCost, totalCost };
        });
    });
    localStorage.setItem('craftingCosts', JSON.stringify(craftingCosts));
    const craftingTableBody = document.getElementById('crafting-cost-table').getElementsByTagName('tbody')[0];
    Object.keys(craftingCosts).forEach((rarity, rowIndex) => {
        const row = craftingTableBody.rows[rowIndex];
        Object.keys(craftingCosts[rarity]).forEach((location, cellIndex) => {
            const { craftCost, burnCost, totalCost } = craftingCosts[rarity][location];
            row.cells[cellIndex + 1].innerHTML = `Craft: $${(craftCost / 100).toFixed(2)}<br>Burn: $${(burnCost / 100).toFixed(2)}<br>Total: $${(totalCost / 100).toFixed(2)}`;
        });
    });
}
