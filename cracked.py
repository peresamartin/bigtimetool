import json

# Load the data from the JSON file
with open('my_items.json', 'r') as file:
    data = json.load(file)

# Extract and print the 'LastCrackedHourGlassDropTime' values
for item in data['items']:
    if 'extra' in item and item['extra'] is not None and 'attributes' in item['extra']:
        for attribute in item['extra']['attributes']:
            if attribute['name'] == 'LastCrackedHourGlassDropTime':
                print(attribute['value'])
            if attribute['name'] == 'LastEpochDropTime':
                print(attribute['value'])
