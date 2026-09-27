import express from 'express';

import {homePage} from './controllers/index.js';
import {organizationsPage} from './controllers/organizations.js';
import {projectsPage} from './controllers/projects.js';
import {categoriesPage} from './controllers/categories.js';
import {testErrorPage} from './controllers/errors.js';

const router = express.Router();

router.get('/', homePage);
router.get('/organizations', organizationsPage);
router.get('/projects', projectsPage);
router.get('/categories', categoriesPage);

router.get('/test-error', testErrorPage)

export default router;