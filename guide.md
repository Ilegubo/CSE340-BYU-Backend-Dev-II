# CSE 340: Dynamic Routes & Service Project Details Implementation Guide

This guide provides a comprehensive, step-by-step walkthrough to complete the **Service Project Details** activity according to the course specifications.

---

## Table of Contents
1. [Activity Overview & Objectives](#activity-overview--objectives)
2. [Step 1: Model Functions (`src/models/projects.js`)](#step-1-model-functions-srcmodelsprojectsjs)
3. [Step 2: Controllers (`src/controllers/projects.js`)](#step-2-controllers-srccontrollersprojectsjs)
4. [Step 3: Route Handlers (`src/routes.js`)](#step-3-route-handlers-srcroutesjs)
5. [Step 4: Views (`src/views/project.ejs` & `src/views/projects.ejs`)](#step-4-views)
   - [4.1 Single Project Details View (`src/views/project.ejs`)](#41-single-project-details-view-srcviewsprojectejs)
   - [4.2 Upcoming Projects List View (`src/views/projects.ejs`)](#42-upcoming-projects-list-view-srcviewsprojectsejs)
6. [Step 5: Styling (`public/css/main.css`)](#step-5-styling-publiccssmaincss)
7. [Step 6: Testing & Verification Checklist](#step-6-testing--verification-checklist)
8. [Group Discussion Questions & Answers](#group-discussion-questions--answers)

---

## Activity Overview & Objectives

In this activity, you are adding:
1. **A new service project details page (`/project/:id`)** that displays the full details of a single service project.
2. **An updated service projects page (`/projects`)** that displays only the next **5 upcoming projects** (date on or after today, ordered chronologically).
3. **Interactive navigation links**:
   - Each project tile in `/projects` links to its details page (`/project/:id`).
   - Each project tile and detail page links to the corresponding organization page (`/organization/:id`).

---

## Step 1: Model Functions (`src/models/projects.js`)

**File**: `src/models/projects.js`

You need two functions to interact with PostgreSQL:
1. `getUpcomingProjects(number_of_projects)`: Queries upcoming projects ordered by date and limited to the given number.
2. `getProjectDetails(id)`: Queries a single project by its primary key ID.

Both queries require an **`INNER JOIN`** with the `organization` table so we can retrieve the organization's name (`o.name AS organization_name`).

### Complete Code: `src/models/projects.js`

```javascript
import db from './db.js';

/**
 * Retrieve all projects (legacy/reference)
 */
const getAllProjects = async () => {
    const query = `
        SELECT project_id, organization_id, title, description, location, date
        FROM public.projects;
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Retrieve all projects for a specific organization
 */
const getProjectsByOrganizationId = async (organizationId) => {
    const query = `
        SELECT
            project_id,
            organization_id,
            title,
            description,
            location,
            date
        FROM projects
        WHERE organization_id = $1
        ORDER BY date;
    `;
    const queryParams = [organizationId];
    const result = await db.query(query, queryParams);
    return result.rows;
};

/**
 * Retrieve upcoming projects ordered by date ascending, limited to number_of_projects
 * @param {number} number_of_projects - Maximum number of projects to return
 */
const getUpcomingProjects = async (number_of_projects = 5) => {
    const query = `
        SELECT
            p.project_id,
            p.title,
            p.description,
            p.date,
            p.location,
            p.organization_id,
            o.name AS organization_name
        FROM projects p
        JOIN organization o ON p.organization_id = o.organization_id
        WHERE p.date >= CURRENT_DATE
        ORDER BY p.date ASC
        LIMIT $1;
    `;
    const queryParams = [number_of_projects];
    const result = await db.query(query, queryParams);
    return result.rows;
};

/**
 * Retrieve the full details for a single project by its ID
 * @param {number|string} id - The project_id
 */
const getProjectDetails = async (id) => {
    const query = `
        SELECT
            p.project_id,
            p.title,
            p.description,
            p.date,
            p.location,
            p.organization_id,
            o.name AS organization_name
        FROM projects p
        JOIN organization o ON p.organization_id = o.organization_id
        WHERE p.project_id = $1;
    `;
    const queryParams = [id];
    const result = await db.query(query, queryParams);
    return result.rows.length > 0 ? result.rows[0] : null;
};

export {
    getAllProjects,
    getProjectsByOrganizationId,
    getUpcomingProjects,
    getProjectDetails
};
```

---

## Step 2: Controllers (`src/controllers/projects.js`)

**File**: `src/controllers/projects.js`

### What to implement:
1. Define a constant: `const NUMBER_OF_UPCOMING_PROJECTS = 5;`.
2. Update `showProjectsPage` to call `getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS)` and set the page title to `"Upcoming Service Projects"`.
3. Create `showProjectDetailsPage` to extract `id = req.params.id`, call `getProjectDetails(id)`, and render the `project` view.
4. Add 404 error handling if no project matches the requested ID so the server doesn't crash on invalid URLs.

### Complete Code: `src/controllers/projects.js`

```javascript
import { getUpcomingProjects, getProjectDetails } from '../models/projects.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

/**
 * Handler for the main projects listing page
 * Displays the next 5 upcoming projects
 */
const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        const title = 'Upcoming Service Projects';
        const template = 'projects';

        res.render(template, { title, projects });
    } catch (error) {
        next(error);
    }
};

/**
 * Handler for a single service project details page
 */
const showProjectDetailsPage = async (req, res, next) => {
    try {
        const id = req.params.id;
        const project = await getProjectDetails(id);

        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }

        res.render('project', {
            title: project.title,
            project
        });
    } catch (error) {
        next(error);
    }
};

export { showProjectsPage, showProjectDetailsPage };
```

---

## Step 3: Route Handlers (`src/routes.js`)

**File**: `src/routes.js`

### What to implement:
1. Import `showProjectDetailsPage` from `./controllers/projects.js`.
2. Clean up any unused imports (e.g. models should not be directly imported into routes).
3. Add the route for `/project/:id` mapped to `showProjectDetailsPage`.

### Complete Code: `src/routes.js`

```javascript
import express from 'express';

import { homePage } from './controllers/index.js';
import { showOrganizationsPage, showOrganizationDetailsPage } from './controllers/organizations.js';
import { showProjectsPage, showProjectDetailsPage } from './controllers/projects.js';
import { categoriesPage } from './controllers/categories.js';
import { testErrorPage } from './controllers/errors.js';

const router = express.Router();

// Top-level navigation routes
router.get('/', homePage);
router.get('/organizations', showOrganizationsPage);
router.get('/projects', showProjectsPage);
router.get('/categories', categoriesPage);

// Service Project Details Route (Required: /project/:id)
// Supporting both /project/:id and /projects/:id ensures complete backwards-compatibility
router.get(['/project/:id', '/projects/:id'], showProjectDetailsPage);

// Organization Details Route
router.get(['/organization/:id', '/organizations/:id'], showOrganizationDetailsPage);

// Error simulation route
router.get('/test-error', testErrorPage);

export default router;
```

---

## Step 4: Views

### 4.1 Single Project Details View (`src/views/project.ejs`)

**File**: `src/views/project.ejs`

This view receives the `project` object and displays:
- Title (`project.title`)
- Description (`project.description`)
- Date (`new Date(project.date).toLocaleDateString()`)
- Location (`project.location`)
- Partner organization name linked to `/organization/<%= project.organization_id %>`
- A link back to the upcoming projects page

### Complete Code: `src/views/project.ejs`

```html
<%- include('partials/header') %>
<main>
    <h1><%= title %></h1>

    <div class="project-details">
        <p>
            <strong>Organization:</strong> 
            <a href="/organization/<%= project.organization_id %>"><%= project.organization_name %></a>
        </p>
        <p>
            <strong>Date:</strong> 
            <%= new Date(project.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) %>
        </p>
        <p><strong>Location:</strong> <%= project.location %></p>
        <p><strong>Description:</strong></p>
        <p><%= project.description %></p>
    </div>

    <p><a href="/projects">&larr; Back to Upcoming Projects</a></p>
</main>
<%- include('partials/footer') %>
```

---

### 4.2 Upcoming Projects List View (`src/views/projects.ejs`)

**File**: `src/views/projects.ejs`

### Important Rule for HTML Links:
In HTML5, **you cannot nest an `<a>` tag inside another `<a>` tag**. Doing so causes browsers to immediately close the first tag and breaks the layout.

To satisfy the requirements cleanly:
- Make the **Project Title** a link pointing to `/project/<%= project.project_id %>`.
- Make the **Organization Name** a link pointing to `/organization/<%= project.organization_id %>`.

### Complete Code: `src/views/projects.ejs`

```html
<%- include('partials/header') %>
<main>
    <h1><%= title %></h1>

    <ul class="projects-list">
        <% projects.forEach(project => { %>
            <li class="project-card">
                <h2>
                    <a href="/project/<%= project.project_id %>"><%= project.title %></a>
                </h2>
                <p>
                    <strong>Organization:</strong> 
                    <a href="/organization/<%= project.organization_id %>"><%= project.organization_name %></a>
                </p>
                <p><strong>Date:</strong> <%= new Date(project.date).toLocaleDateString() %></p>
                <p><strong>Location:</strong> <%= project.location %></p>
                <p><%= project.description %></p>
            </li>
        <% }) %>
    </ul>
</main>
<%- include('partials/footer') %>
```

---

## Step 5: Styling (`public/css/main.css`)

**File**: `public/css/main.css`

Ensure project cards display nicely as distinct cards with clear clickable links:

```css
.projects-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.project-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.25rem;
    background-color: #fcfcfc;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.project-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.project-card h2 {
    margin-top: 0;
}

.project-card h2 a {
    color: #1a56db;
    text-decoration: none;
}

.project-card h2 a:hover {
    text-decoration: underline;
}

.project-details {
    background-color: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
    border-left: 4px solid #1a56db;
    margin-bottom: 1.5rem;
}
```

---

## Step 6: Testing & Verification Checklist

Run your development server:
```bash
npm run dev
```

Test each item in your browser:

1. **Verify `/projects` (Upcoming Projects Page)**:
   - [ ] Page title displays `"Upcoming Service Projects"`.
   - [ ] Exactly **5 projects** are listed.
   - [ ] All dates are in the future or equal to today, ordered chronologically.
   - [ ] Clicking on a project title navigates to `/project/[id]`.
   - [ ] Clicking on an organization name navigates to `/organization/[id]`.

2. **Verify `/project/:id` (Project Details Page)**:
   - [ ] Visit `/project/1`.
   - [ ] Title, description, date, and location are displayed.
   - [ ] Organization name is displayed and links to `/organization/:id`.
   - [ ] The "Back to Upcoming Projects" link takes you back to `/projects`.

3. **Verify 404 / Missing Record Handling**:
   - [ ] Visit `/project/99999` (non-existent ID).
   - [ ] Ensure the app does not crash with a null property error.

---

## Group Discussion Questions & Answers

### 1. Why do each of these queries need to have a `JOIN` in them?
**Answer**: In relational database design (normalization), projects and organizations are stored in separate tables (`projects` and `organization`) to prevent data duplication. The `projects` table holds an `organization_id` foreign key, but not the organization's name. A `JOIN` is necessary to combine rows from both tables matching on `p.organization_id = o.organization_id` so the application can retrieve and display the human-readable organization name alongside project details in a single query.

### 2. What is the benefit of using a placeholder (`$1`) in the SQL query instead of concatenating the value into the query string?
**Answer**: 
- **Security (SQL Injection Prevention)**: Parameterized queries pass user input separately from the SQL statement to the database engine, ensuring input is treated purely as data and never executed as SQL code.
- **Data Typing & Escaping**: The database driver automatically handles proper escaping and type conversions for integers, dates, and strings.
- **Performance**: Many database engines prepare and cache query execution plans for parameterized queries, improving execution speed across repeated calls.

### 3. What is the benefit of using a route parameter for the ID (`/project/:id`) instead of a query parameter (`/project?id=...`)?
**Answer**:
- **RESTful Resource Semantics**: Route parameters represent hierarchical resource identity (identifying a specific resource entity: `/project/1`), whereas query parameters are traditionally used for filtering, sorting, or pagination (e.g., `/projects?limit=5&sort=date`).
- **Clean URLs & User Experience**: Route parameters produce cleaner, readable, bookmark-friendly, and shareable URLs.
- **SEO & Routing Convention**: Search engines and web routing frameworks treat path parameters as distinct pages, improving indexing and matching standard web architecture conventions.
