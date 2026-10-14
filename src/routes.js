import express from 'express';

import { homePage } from './controllers/index.js';

import {
    showOrganizationsPage,
    showOrganizationDetailsPage, showNewOrganizationForm,processNewOrganizationForm,
    organizationValidation,
    showEditOrganizationForm,
    processEditOrganizationForm
}
from './controllers/organizations.js';

import { 

    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm
}
from './controllers/projects.js';

import {
    showCategoriesPage,
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm
}
from './controllers/categories.js';

import {
    testErrorPage
}
from './controllers/errors.js';

const router = express.Router();

router.get('/', homePage);
router.get('/organizations', showOrganizationsPage);
router.get('/projects', showProjectsPage);
router.get('/categories', showCategoriesPage);

router.get('/test-error', testErrorPage);

// Route for organization details page
router.get(['/organization/:id', '/organizations/:id'], showOrganizationDetailsPage);

// Route for service project details page
router.get(['/project/:id', '/projects/:id'], showProjectDetailsPage);
router.get(['/categories/:id', '/category/:id'], showCategoryDetailsPage);

router.get('/new-organization', showNewOrganizationForm);
router.post('/new-organization', organizationValidation, processNewOrganizationForm);

router.get('/edit-organization/:id', showEditOrganizationForm);
router.post('/edit-organization/:id', organizationValidation, processEditOrganizationForm)

// Route for new project page
router.get('/new-project', showNewProjectForm);
// Route to handle new project form submission
router.post('/new-project', processNewProjectForm);

// Routes to handle the assign categories to project form
router.get('/assign-categories/:projectId', showAssignCategoriesForm);
router.post('/assign-categories/:projectId', processAssignCategoriesForm);


export default router;