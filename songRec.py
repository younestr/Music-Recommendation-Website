import numpy as np
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['musicRec_database']

# Function to calculate Euclidean distance between two songs
def euclidean_distance(song1, song2):
    features = ['valence', 'year', 'acousticness', 'danceability', 'duration_ms', 
                'energy', 'explicit', 'instrumentalness', 'key', 'liveness', 
                'loudness', 'mode', 'popularity', 'speechiness', 'tempo']
    distance = 0
    for feature in features:
        if feature in song1 and feature in song2:  # Check if both songs have the feature
            distance += (song1[feature] - song2[feature]) ** 2
    return np.sqrt(distance)

# Function to recommend similar songs based on the features of a given song
def recommend_similar_songs(song_name, k=5):
    similar_songs = []
    songs_collection = db.artistImport
    song = songs_collection.find_one({'name': song_name})
    if song:
        for other_song in songs_collection.find({"name": {"$ne": song_name}}):
            distance = euclidean_distance(song, other_song)
            similar_songs.append((other_song['name'], other_song['artists'], distance, other_song['id']))
        similar_songs.sort(key=lambda x: x[2])
        return similar_songs[:k]
    else:
        print(f"Song '{song_name}' not found in the artistImport collection.")
        return []

# Function to create the songSelect collection
def create_song_select_collection():
    songs_collection = db.artistImport
    song_select_collection = db.songSelect
    for song in songs_collection.find():
        song_name = song['name']
        similar_songs = recommend_similar_songs(song_name)
        tags = [{'name': name, 'artists': artists, 'distance': distance, 'id': song_id} for name, artists, distance, song_id in similar_songs]
        song_select_collection.insert_one({'name': song_name, 'tags': tags})

# Call the function to create the songSelect collection
create_song_select_collection()
