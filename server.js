const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3019;

const app = express();
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/musicRec_database', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => {
    console.log("MongoDB connection successful");
});

// Serve the form HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});

// Define Mongoose schema for Users
const UserSchema = new mongoose.Schema({
    username: String,
    email: String
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
    favorite_artists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
    }],
    favorite_genres: [String],
    favorite_songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    favorite_albums: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
    }]
});

const UserPreferences = mongoose.model('UserPreferences', UserPreferencesSchema);

// Handle user submission
app.post('/postUser', (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email
    });

    newUser.save()
        .then(user => {
            console.log('User saved successfully:', user);
            res.redirect('/'); // Redirect to the root path after successful submission
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error saving user to database');
        });
});

// Handle artist submission
app.post('/postArtist', async (req, res) => {
    const genreArray = Array.isArray(req.body.genre) ? req.body.genre : [req.body.genre];
    const newArtist = new Artist({
        artistName: req.body.artistName,
        genre: genreArray,
        albums: [] // Initialize albums array
    });

    try {
        const savedArtist = await newArtist.save();
        console.log('Artist saved successfully:', savedArtist);
        // Save albums for the artist
        await saveAlbums(savedArtist._id, req.body);
        res.redirect('/'); // Redirect to the root path after successful submission
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving artist to database');
    }
});

// Function to save albums associated with the artist
async function saveAlbums(artistId, body) {
    // Extract album data from the request body
    const albumsData = [
        { title: body.albumTitle1, releaseDate: body.releaseDate1 },
        { title: body.albumTitle2, releaseDate: body.releaseDate2 }
    ];

    // Loop through each album data and save it
    for (const albumData of albumsData) {
        const newAlbum = new Album({
            albumTitle: albumData.title,
            releaseDate: albumData.releaseDate,
            artist: artistId
        });
        await newAlbum.save();
    }
}

// Handle song submission
app.post('/postSong', async (req, res) => {
    try {
        const newSong = new Song({
            title: req.body.title,
            artist: req.body.artist,
            genre: Array.isArray(req.body.genre) ? req.body.genre : [req.body.genre], // Ensure genre is an array
            album: req.body.album
        });

        const savedSong = await newSong.save();
        console.log('Song saved successfully:', savedSong);
        res.redirect('/'); // Redirect to the root path after successful submission
    } catch (err) {
        console.error('Error saving song:', err);
        res.status(500).send('Error saving song to database');
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

// Listen on port
app.listen(port, () => {
    console.log("Server started");
});
