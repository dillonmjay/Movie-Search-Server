const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const USERS_FILE = "users.json";

app.use(cors());
app.use(bodyParser.json());

// Read users from file
function getUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE));
}

// Write users to file
function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}


const crypto = require("crypto"); // For generating unique IDs

// ✅ **Signup Route with Unique User ID**
app.post("/signup", (req, res) => {
    let users = getUsers();
    const { username, password } = req.body;

    if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Generate a unique ID for the user
    const userID = crypto.randomBytes(6).toString("hex");

    users.push({ id: userID, username, password, favorites: [] }); // Add user with unique ID
    saveUsers(users);

    res.json({ success: true, message: "Signup successful", userID });
});





const path = require("path");

// ✅ **Serve favourites.html**
app.get("/favourites.html", (req, res) => {
    res.sendFile(path.join(__dirname, "favourites.html"));
});




app.get("/get-user-id", (req, res) => {
    let users = getUsers();
    const { username } = req.query;

    let user = users.find(user => user.username === username);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, userID: user.id });
});

// ✅ Fix: Corrected API Route to Get User Favorites by ID
app.get("/api/user-favorites/:userID", (req, res) => {
    let users = getUsers();
    const { userID } = req.params;

    let user = users.find(user => user.id === userID);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, username: user.username, favorites: user.favorites || [] });
});



app.post("/login", (req, res) => {
    let users = getUsers();
    const { username, password } = req.body;

    let user = users.find(user => user.username === username && user.password === password);

    if (user) {
        res.json({ success: true, message: "Login successful" });
    } else {
        res.status(401).json({ success: false, message: "Invalid username or password" });
    }
});

app.post("/save-favorites", (req, res) => {
    let users = getUsers();
    const { username, id, title, poster } = req.body;

    let user = users.find(user => user.username === username);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!user.favorites) user.favorites = [];
    if (!user.favorites.some(movie => movie.id === id)) {
        user.favorites.push({ id, title, poster });
        saveUsers(users);
    }

    res.json({ success: true, message: "Favorite saved" });
});

app.get("/get-favorites", (req, res) => {
    let users = getUsers();
    const { username } = req.query;

    let user = users.find(user => user.username === username);
    if (!user) {
        return res.status(404).json({ success: false, favorites: [] });
    }

    res.json({ success: true, favorites: user.favorites || [] });
});

// Remove Favorite Route
app.post("/remove-favorite", (req, res) => {
    let users = getUsers();
    const { username, id } = req.body;

    let user = users.find(user => user.username === username);
    if (!user) return res.json({ success: false, message: "User not found" });

    user.favorites = user.favorites.filter(movie => movie.id !== id);
    saveUsers(users);

    res.json({ success: true, message: "Favorite removed" });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
