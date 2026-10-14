import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

// import database test connection
import { testConnection } from './src/models/db.js';

import router from './src/routes.js';

import { handleErrors } from './src/controllers/errors.js';

import session from 'express-session';
import flash from './src/middleware/flash.js'

// Define the application environment
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

// Define the port number the server will listen on
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SESSION_SECRET=process.env.SESSION_SECRET;

const app = express();

// Set ejs as templating engine
app.set('view engine', 'ejs');
// Tell Express where to find ejs files
app.set('views', path.join(__dirname, 'src/views'));

// Set up session management
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 } // Session expires after 1 hour of inactivity
}));

// Use flash message middleware
app.use(flash);

// Middleware to log all incoming requests
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`Request method => ${req.method} | RequestURL => ${req.url}`);
    }
    next(); // Pass control to the next middleware or route
});

// Middleware to make NODE_ENV available to all templates
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV;
    next();
});

// Allow Express to receive and process common POST data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(router)

app.use(handleErrors)

app.listen(PORT, async () => {
  try {
    await testConnection();
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});