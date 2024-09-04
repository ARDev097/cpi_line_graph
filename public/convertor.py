import csv
import json

# Define the input CSV file and output JSON file
csv_file_path = 'output_hhi_cpi.csv'
json_file_path = 'output_hhi_cpi.json'

# Read the CSV file
with open(csv_file_path, mode='r', newline='', encoding='utf-8') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    # Convert CSV data to a list of dictionaries
    data = list(csv_reader)

# Write the JSON file
with open(json_file_path, mode='w', encoding='utf-8') as json_file:
    json.dump(data, json_file, indent=4)

print(f'CSV file has been converted to JSON and saved to {json_file_path}')
