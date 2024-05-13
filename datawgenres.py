import pandas as pd
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['musicRec_database']

# Read data from CSV
data_w_genre = pd.read_csv('data_w_genres.csv')

# Convert DataFrame to dictionary
data_w_genre_dict = data_w_genre.to_dict(orient='records')

# Insert data into MongoDB collection
db['data_w_genre_collection'].insert_many(data_w_genre_dict)

print('Data inserted into MongoDB collection.')
