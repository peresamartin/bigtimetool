## Installing and Running the Plugin

1. Navigate to `chrome://extensions/` in your Chrome browser.
2. If you have the plugin as a compressed `.zip` file, unzip it to a desired location on your computer.
2. Enable Developer mode by clicking the toggle switch at the top right.
3. Click the `Load unpacked` button and select the `plugin_cracked` directory.
4. The plugin should now be installed and you will see it in your list of extensions.
5. To run the plugin, simply click on its icon in the extensions bar of your browser.
6. To pin the plugin to the taskbar for easy access, click on the Extensions icon (puzzle piece) in the Chrome toolbar, find the plugin in the list, and click the pin icon next to it.

## Permissions Explanation

### Viewing Chrome Storage Data

To view the data stored by the plugin in Chrome's storage:

1. Open the Chrome DevTools by right-clicking anywhere on the page and selecting "Inspect" or by pressing `Ctrl+Shift+I` (`Cmd+Option+I` on Mac).
2. Navigate to the "Application" tab.
3. In the left sidebar, expand the "Storage" section and click on "Local Storage" or "Session Storage" depending on where the data is stored.
4. Click on the relevant item under the "Local Storage" or "Session Storage" section to view the stored data.

This can be useful for debugging purposes or to manually check the data stored by the plugin.

### Data Storage

The plugin stores the following data locally using Chrome's storage API:

- `spaceData`: An array of objects representing each hourglass item, including its issued ID, archetype ID, and the last time the hourglass was cracked.
   Each object in the `spaceData` array contains the following properties:
   - `issuedId`: The unique identifier for the space.
   - `archetypeId`: The identifier for the type of space.
   - `lastCrackedHourGlassDropTime`: The timestamp of the last hourglass drop for the space.
   - `rarity`: The rarity category of the space (e.g., Rare, Epic, Legendary, Mythic, Exalted).
   - `size`: The size category of the space (e.g., Small, Medium, Large).
   - `spawnInterval`: The time interval in hours for the space to spawn a new cracked hourglass, which depends on the rarity and size.
- `timeWardenTotalItems`: The total number of TimeWarden items owned by the user, used for calculating the number of wardens needed for dismantling.
- `targetDate`: The user's set target date for the countdown feature within the plugin.
 - `avgCrackedDrops`: The average number of cracked hourglasses dropped every 48 hours, used for revenue estimation and warden calculation.
 - `userTotalSpaces`: The total number of spaces owned by the user, used for revenue estimation and warden calculation.

This data is essential for the plugin's functionality, allowing it to provide personalized information and to maintain state across browser sessions.

### Storage Permission

The `storage` permission is required to locally store data such as the fetched hourglass data and user preferences. This allows the plugin to save and retrieve this data across browser sessions, providing a persistent and seamless user experience.

### Host Permissions

The `host_permissions` are needed to allow the plugin to make network requests to specific URLs. The plugin fetches data from the Open Loot API to retrieve information about in-game items and uses Google's Looker Studio for displaying the leaderboard. These permissions ensure that the plugin can securely and reliably access the necessary external resources. The plugin also fetches the current price of the BigTime token from the CoinGecko API.

## Remote Code Usage

The plugin uses remote code in the following ways:

1. Fetching data from the Open Loot API (`https://api.openloot.com/v2/market/items/in-game`) to retrieve information about in-game items.
2. Fetching the current price of the BigTime token from the CoinGecko API (`https://api.coingecko.com/api/v3/simple/price`).
3. Accessing Google's Looker Studio (`https://lookerstudio.google.com/reporting/*`) for displaying the leaderboard.
4. Providing links to Open Loot's marketplace and rental pages (`https://openloot.com`) for user interaction.
5. Dynamically setting links to Google's Looker Studio within the plugin's popup for accessing the leaderboard.

These remote interactions are essential for the plugin's functionality, allowing it to provide up-to-date information and relevant links to the users.

update datatables and jquery from https://datatables.net/download/index
