import express from 'express';

import { homePage } from './controllers/index.js';
import { showOrganizationsPage, showOrganizationDetailsPage } from './controllers/organizations.js';
import { showProjectsPage, showProjectDetailsPage } from './controllers/projects.js';
import { categoriesPage } from './controllers/categories.js';
import { testErrorPage } from './controllers/errors.js';

const router = express.Router();

router.get('/', homePage);
router.get('/organizations', showOrganizationsPage);
router.get('/projects', showProjectsPage);
router.get('/categories', categoriesPage);

router.get('/test-error', testErrorPage);

// Route for organization details page
router.get(['/organization/:id', '/organizations/:id'], showOrganizationDetailsPage);

// Route for service project details page
router.get(['/project/:id', '/projects/:id'], showProjectDetailsPage);

export default router;