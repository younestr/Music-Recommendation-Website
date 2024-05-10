const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const port = 3019;


const app = express();
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add this line to parse JSON bodies


mongoose.connect('mongodb://127.0.0.1:27017/musicRec_database', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => {
    console.log("MongoDB connection successful");
});

// Serve the form HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});




// Serve the add_artist.html file
app.get('/add_artist', (req, res) => {
    res.sendFile(path.join(__dirname, 'add_artist.html'));
});

// Serve the add_song.html file
app.get('/add_song', (req, res) => {
    res.sendFile(path.join(__dirname, 'add_song.html'));
});

// Serve the user_preferences.html file
app.get('/user_preferences', (req, res) => {
    res.sendFile(path.join(__dirname, 'user_preferences.html'));
});

// Serve the get_song_recommendations.html file
app.get('/get_song_recommendations', (req, res) => {
    res.sendFile(path.join(__dirname, 'get_song_recommendations.html'));
});

// Serve the registration form
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'add_user.html'));
});


// Define Mongoose schema for Users
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String // Hashed password will be stored
});
const User = mongoose.model('User', UserSchema);

// Define Mongoose schema for Artists
const ArtistSchema = new mongoose.Schema({
    artistName: String,
    genre: [String],
    albums: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
    }]
});
const Artist = mongoose.model('Artist', ArtistSchema);

// Define Mongoose schema for Albums
const AlbumSchema = new mongoose.Schema({
    albumTitle: String,
    releaseDate: Date,
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
    }
});
const Album = mongoose.model('Album', AlbumSchema);

// Define Mongoose schema for Songs
const SongSchema = new mongoose.Schema({
    title: String,
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
    },
    genre: [String],
    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
    }
});
const Song = mongoose.model('Song', SongSchema);

// Define Mongoose schema for UserPreferences
const UserPreferencesSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    favoriteArtists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
    }],
    favoriteGenres: [String],
    favoriteSongs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    favoriteAlbums: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
    }]
});

const UserPreferences = mongoose.model('UserPreferences', UserPreferencesSchema);

app.post('/register', async (req, res) => {
    try {
        
        console.log('req body was', req.body)
        console.log('req params were', req.params)
        console.log('req query was', req.query)
        
        const { username, email, password } = req.body; // Corrected object property names
        
        // Check if username and password are not null
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username or password cannot be null' });
        }

        // Check if the username or email already exists
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists', user: username });
        }

        // Create a new user
        const newUser = new User({
            username: username,
            email: email,
            password: password,
        });

        // Save the user to the database
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Route to fetch all users
app.get('/getUsers', async (req, res) => {
    try {
        const users = await User.find({}, 'username'); // Fetch usernames only
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Error fetching users');
    }
});


// Route to fetch all artists
app.get('/getArtists', async (req, res) => {
    try {
        const artists = await Artist.find({}, 'artistName'); // Fetch artist names only
        res.json(artists);
    } catch (err) {
        console.error('Error fetching artists:', err);
        res.status(500).send('Error fetching artists');
    }
});

// Route to fetch albums for a specific artist
app.get('/getAlbums/:artistId', async (req, res) => {
    try {
        const artistId = req.params.artistId;
        const albums = await Album.find({ artist: artistId });
        res.json(albums);
    } catch (err) {
        console.error('Error fetching albums:', err);
        res.status(500).send('Error fetching albums');
    }
});

// Route to fetch all albums
app.get('/getAlbums', async (req, res) => {
    try {
        const albums = await Album.find({}, 'albumTitle'); // Fetch album titles only
        res.json(albums);
    } catch (err) {
        console.error('Error fetching albums:', err);
        res.status(500).send('Error fetching albums');
    }
});

// Route to fetch all songs
app.get('/getSongs', async (req, res) => {
    try {
        const songs = await Song.find({}, 'title'); // Fetch song titles only
        res.json(songs);
    } catch (err) {
        console.error('Error fetching songs:', err);
        res.status(500).send('Error fetching songs');
    }
});

// Route to fetch user preferences with populated fields
app.get('/getUserPreferences', async (req, res) => {
    try {
        const userPreferences = await UserPreferences.find({})
            .populate('favoriteArtists', 'artistName')
            .populate('favoriteSongs', 'title')
            .populate('favoriteAlbums', 'albumTitle');

        res.json(userPreferences);
    } catch (err) {
        console.error('Error fetching user preferences:', err);
        res.status(500).send('Error fetching user preferences');
    }
});

// Handle user preferences submission
app.post('/postUserPreferences', async (req, res) => {
    try {
        // Extract user preferences data from the request body
        const userPreferencesData = req.body;

        // Create a new UserPreferences document with the extracted data
        const newUserPreferences = new UserPreferences(userPreferencesData);

        // Save the new user preferences document to the database
        await newUserPreferences.save();

        // Respond with a success message
        console.log('user preferences:', userPreferencesData);
        res.send(userPreferencesData);

    } catch (err) {
        // Handle errors
        console.error('Error saving user preferences:', err);
        res.status(500).send('Error saving user preferences');
    }
});

// Route to get song recommendations
app.get('/getSongRecommendations/:songName', async (req, res) => {
    try {
        const songName = req.params.songName;
        // Call the recommend_similar_songs function with the provided song name
        const recommendations = await recommend_similar_songs(songName);
        res.json(recommendations);
    } catch (err) {
        console.error('Error fetching song recommendations:', err);
        res.status(500).send('Error fetching song recommendations');
    }
});

// Listen on port
app.listen(port, () => {
    console.log("Server started");
});
  
