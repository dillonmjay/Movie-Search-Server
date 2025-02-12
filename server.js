const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let users = []; // Temporary storage in memory

// ✅ **Signup Route with Unique User ID**
app.post("/signup", (req, res) => {
    const { username, password } = req.body;

    if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Generate a unique ID for the user
    const userID = crypto.randomBytes(6).toString("hex");

    users.push({ id: userID, username, password, favorites: [] });

    res.json({ success: true, message: "Signup successful", userID });
});

// ✅ Get User ID by Username
app.get("/get-user-id", (req, res) => {
    const { username } = req.query;
    let user = users.find(user => user.username === username);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, userID: user.id });
});

// ✅ Get User Favorites by ID
app.get("/api/user-favorites/:userID", (req, res) => {
    const { userID } = req.params;
    let user = users.find(user => user.id === userID);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, username: user.username, favorites: user.favorites || [] });
});

// ✅ Login Route
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    let user = users.find(user => user.username === username && user.password === password);

    if (user) {
        res.json({ success: true, message: "Login successful" });
    } else {
        res.status(401).json({ success: false, message: "Invalid username or password" });
    }
});

// ✅ Save Favorite Movies
app.post("/save-favorites", (req, res) => {
    const { username, id, title, poster } = req.body;
    let user = users.find(user => user.username === username);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!user.favorites.some(movie => movie.id === id)) {
        user.favorites.push({ id, title, poster });
    }

    res.json({ success: true, message: "Favorite saved" });
});

// ✅ Get User Favorites
app.get("/get-favorites", (req, res) => {
    const { username } = req.query;
    let user = users.find(user => user.username === username);
    if (!user) {
        return res.status(404).json({ success: false, favorites: [] });
    }
    res.json({ success: true, favorites: user.favorites || [] });
});

// ✅ Remove Favorite Movie
app.post("/remove-favorite", (req, res) => {
    const { username, id } = req.body;
    let user = users.find(user => user.username === username);
    if (!user) return res.json({ success: false, message: "User not found" });

    user.favorites = user.favorites.filter(movie => movie.id !== id);
    res.json({ success: true, message: "Favorite removed" });
});

// ✅ Export Express App for Vercel
module.exports = app;