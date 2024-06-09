const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("./config/passport.js");
const path = require("path");
const { initializeWebSocketServer } = require('./server');
const pg = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Enable CORS for all routes
app.use(cors());

// index.js
// Routes
const authRoutes = require("./routes/authRoutes.js");
app.use("/auth", authRoutes); // Use the authentication routes

// Serve static files from the React app
const clientAppPath = path.resolve(__dirname, "../../client");
app.use(express.static(clientAppPath));

// Catch all other requests and return the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(clientAppPath, "index.html"));
});

// PostgreSQL connection configuration
const pool = new pg.Pool({
  user: "adot824",
  host: "localhost",
  database: "socialstudydb",
  password: "ajnchick",
  port: 5432, // Default PostgreSQL port
});

// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Express: Error acquiring client", err.stack);
  }

  client.query("SELECT NOW()", (err, result) => {
    release();
    if (err) {
      return console.error("Express: Error executing query", err.stack);
    }
    console.log("Express: Connected to PostgreSQL at:", result.rows[0].now);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Express: " + err.stack);
  res.status(500).send("Something broke!");
});

// Export the pool for use in other modules
module.exports = pool;

// Start the server
app.listen(PORT, () => {
  console.log(`Express: Node server engaging ⏩ -> Listening on port ${PORT}`);
});

// Initialize WebSocket server
const httpServer = initializeWebSocketServer(app);
