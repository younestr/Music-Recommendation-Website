import pandas as pd
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['musicRec_database']

# Load data_by_artist.csv
data_by_artist = pd.read_csv('data_by_artist.csv')

# Define MongoDB collection
data_by_artist_collection = db['data_by_artist']

# Convert DataFrame to dictionary and insert into MongoDB collection
data_by_artist_dict = data_by_artist.to_dict(orient='records')
data_by_artist_collection.insert_many(data_by_artist_dict)

print("Data inserted into MongoDB collection successfully.")
