const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');
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

// Add unique indexes to enforce uniqueness of username and email
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

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
        const existingUsername = await User.findOne({ username: username });
        const existingEmail = await User.findOne({ email: email });

        console.log('Existing Username:', existingUsername);
        console.log('Existing Email:', existingEmail);
        
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already exists', user: username });
        }

        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists', email: email });
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


// Route to handle adding a new artist
app.post('/postArtist', async (req, res) => {
    try {
        // Extract artist data from the request body
        const { artistName, genre, albums } = req.body;

        // Create a new Artist document
        const newArtist = new Artist({
            artistName: artistName,
            genre: genre,
            albums: albums
        });

        // Save the new artist to the database
        await newArtist.save();

        // Respond with a success message
        res.status(201).json({ message: 'Artist added successfully', artist: newArtist });
    } catch (error) {
        // Handle errors
        console.error('Error adding artist:', error);
        res.status(500).json({ message: 'Error adding artist' });
    }
});

// Route to handle adding a new song
app.post('/postSong', async (req, res) => {
    try {
        // Extract song data from the request body
        const { title, artist, genre, album } = req.body;

        // Create a new Song document
        const newSong = new Song({
            title: title,
            artist: artist,
            genre: genre,
            album: album
        });

        // Save the new song to the database
        await newSong.save();

        // Respond with a success message
        res.status(201).json({ message: 'Song added successfully', song: newSong });
    } catch (error) {
        // Handle errors
        console.error('Error adding song:', error);
        res.status(500).json({ message: 'Error adding song' });
    }
});


// Route to handle user login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({ message: 'Username or password cannot be null' });
        }

        // Find the user by username
        const user = await User.findOne({ username });

        // If user not found
        if (!user) {
            return res.status(401).json({ message: 'Username not found' });
        }

        // Check if password matches
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Password is correct, user is authenticated
        // You may set up a session or generate a token here

        // Redirect or send response indicating successful login
        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login failed:', error);
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
app.post('/getSongRecommendations', async (req, res) => {
    try {
        const { songName } = req.body;

        // Dummy response for testing
        const recommendations = [
            { title: 'Green Grass of Tunnel', artist: 'múm' },
            { title: 'M.E.M.P.H.I.S.', artist: 'Hypnotize Camp Posse' },
            { title: 'Pehla Nasha', artist: 'Udit Narayan, Sadhana Sargam' },
            { title: 'With Me', artist: 'Sum 41' },
            { title: 'Laundry Room', artist: 'The Avett Brothers' }
        ];

        // Return the recommendations
        res.json(recommendations);
    } catch (error) {
        console.error('Error fetching song recommendations:', error);
        res.status(500).send('Error fetching song recommendations');
    }
});


// Function to calculate similarity with other songs
async function calculateSimilarity(song) {
    try {
        // Query all songs from data_collection except the input song
        const allSongs = await db.collection('data_collection').find({ name: { $ne: song.name } }).toArray();

        // Calculate similarity with each song
        const similarities = allSongs.map(otherSong => ({
            title: otherSong.name,
            similarity: calculateSimilarityScore(song, otherSong)
        }));

        // Sort by similarity score in descending order
        similarities.sort((a, b) => b.similarity - a.similarity);

        // Return top N recommendations
        return similarities.slice(0, 5);
    } catch (error) {
        console.error('Error calculating similarity:', error);
        return [];
    }
}

// Function to calculate similarity score between two songs
function calculateSimilarityScore(song1, song2) {
    // Define attributes to compare and their weights (adjust weights as needed)
    const attributesAndWeights = {
        valence: 1,
        acousticness: 1,
        danceability: 1,
        energy: 1,
        year: 1,
        duration_ms: 1,
        explicit: 1,
        instrumentalness: 1,
        key: 1,
        liveness: 1,
        loudness: 1,
        mode: 1,
        popularity: 1,
        speechiness: 1,
        tempo: 1
    };

    // Calculate Euclidean distance between attribute vectors of the two songs
    let squaredDifferencesSum = 0;
    for (const attr in attributesAndWeights) {
        if (Object.hasOwnProperty.call(attributesAndWeights, attr)) {
            const weight = attributesAndWeights[attr];
            squaredDifferencesSum += weight * Math.pow(song1[attr] - song2[attr], 2);
        }
    }
    const euclideanDistance = Math.sqrt(squaredDifferencesSum);

    // Convert Euclidean distance to a similarity score
    // Adjust as needed based on your preference
    return 1 / (1 + euclideanDistance);
}

// Listen on port
app.listen(port, () => {
    console.log("Server started");
});
  
