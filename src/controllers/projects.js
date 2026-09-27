import {getAllProjects} from '../models/projects.js'

const projectsPage = async (req, res) => {
    const projects = await getAllProjects();
    const title = 'Projects';
    const template = 'projects'; 

    res.render(template, {title, projects});
}

export {projectsPage};