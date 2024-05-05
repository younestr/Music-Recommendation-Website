const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3001;

const app = express();
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/testUser', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => {
    console.log("MongoDB connection successful");
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'add_user2.html'));
});

app.get('/add_user', (req, res) => {
    res.sendFile(path.join(__dirname, 'add_user2.html'));
});

// Define the User model in a separate file, e.g., models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;

// Define the register endpoint
app.post('/register', (req, res) => {
    const { registerUsername, registerEmail, registerPassword } = req.body;

    // Create a new user document using Mongoose schema
    const newUser = new User({
        username: registerUsername,
        email: registerEmail,
        password: registerPassword
    });

    // Save the new user to the database
    newUser.save((err) => {
        if (err) {
            console.error('Error registering user:', err);
            res.status(500).send('Error registering user');
            return;
        }
        console.log('User registered successfully');
        res.status(200).send('User registered successfully');
    });
});

app.listen(port, () => {
    console.log("Server started");
});
