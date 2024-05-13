import pandas as pd
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['musicRec_database']

# Read data from CSV
data_by_year = pd.read_csv('data_by_year.csv')

# Convert DataFrame to dictionary
data_by_year_dict = data_by_year.to_dict(orient='records')

# Insert data into MongoDB collection
db['data_by_year_collection'].insert_many(data_by_year_dict)

print('Data inserted into MongoDB collection.')
