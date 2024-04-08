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

// Handle form submission
app.post('/post', (req, res) => {
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

app.listen(port, () => {
    console.log("Server started");
});
