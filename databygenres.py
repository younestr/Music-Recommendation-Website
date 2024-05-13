import pandas as pd
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['musicRec_database']

# Read data from CSV
data_by_genres = pd.read_csv('data_by_genres.csv')

# Convert DataFrame to dictionary
data_by_genres_dict = data_by_genres.to_dict(orient='records')

# Insert data into MongoDB collection
db['data_by_genres_collection'].insert_many(data_by_genres_dict)

print('Data inserted into MongoDB collection.')
