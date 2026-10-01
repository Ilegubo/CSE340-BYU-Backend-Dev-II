import { getUpcomingProjects, getProjectDetails } from '../models/projects.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

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