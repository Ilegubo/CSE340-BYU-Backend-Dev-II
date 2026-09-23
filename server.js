import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
// import database test connection
import { testConnection } from './src/models/db.js';
//import all organizations
import { getAllOrganizations } from './src/models/organizations.js';
//import all projects
import {getAllProjects} from './src/models/projects.js';
//import all categories
import {getAllCategories} from './src/models/categories.js';

// Define the application environment
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

// Define the port number the server will listen on
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set view engine
app.set('view engine', 'ejs');
// Tell Express where to find ejs files
app.set('views', path.join(__dirname, 'src/views'));

/**
  * Configure Express middleware
  */

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

/**
  * Routes
  */
app.get('/', async (req, res) => {
    const title = 'Home';
    const template = 'home';
    res.render(template, { title });
});

/*
app.get('/organizations', async (req, res) => {
    const title = 'Our Partner Organizations';
    const template = 'organizations';
    res.render(template, { title });
});
*/

//new route for organizations
app.get('/organizations', async (req, res) => {
    const organizations = await getAllOrganizations();
    console.log(organizations);      
    const title = 'Our Partner Organizations';
    const template = 'organizations';
    res.render(template, { title, organizations });
});

app.get('/projects', async (req, res) => {
  const projects = await getAllProjects();
  console.log(projects)
  const title = 'Service Projects';
  const template = 'projects';
  res.render(template, { title, projects });
});

app.get('/categories', async (req, res) => {
  const categories = await getAllCategories();
  console.log(categories);
  const title = 'Categories';
  const template = 'categories';
  res.render(template, { title, categories });
});

/*app.listen(PORT, () => {
  console.log(`Server is running at http://127.0.0.1:${PORT}`);
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});*/

app.listen(PORT, async () => {
  try {
    await testConnection();
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});