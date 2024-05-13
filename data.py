import pandas as pd
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['musicRec_database']

# Read data from CSV
data = pd.read_csv('data.csv')

# Convert DataFrame to dictionary
data_dict = data.to_dict(orient='records')

# Insert data into MongoDB collection
db['data_collection'].insert_many(data_dict)

print('Data inserted into MongoDB collection.')
