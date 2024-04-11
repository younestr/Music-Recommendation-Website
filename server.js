const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3019;

const app = express();
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/musicRec_database');
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
        albumTitle: String,
        releaseDate: Date
    }]
});
const Artist = mongoose.model('Artist', ArtistSchema);

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
app.post('/postArtist', (req, res) => {
    // Parse the genre field as an array
    const genreArray = Array.isArray(req.body.genre) ? req.body.genre : [req.body.genre];
    const newArtist = new Artist({
        artistName: req.body.artistName,
        genre: genreArray,
        albums: [{
            albumTitle: req.body.albumTitle1,
            releaseDate: req.body.releaseDate1
        }, {
            albumTitle: req.body.albumTitle2,
            releaseDate: req.body.releaseDate2
        }]
    });

    newArtist.save()
        .then(artist => {
            console.log('Artist saved successfully:', artist);
            res.redirect('/'); // Redirect to the root path after successful submission
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error saving artist to database');
        });
});

app.listen(port, () => {
    console.log("Server started");
});
