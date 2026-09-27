import { getAllOrganizations } from "../models/organizations.js"

const organizationsPage = async(req, res) => {

    const organizations = await getAllOrganizations();
    const title = 'Our Partner Organizations';
    const template = 'organizations';

    res.render(template, {title, organizations});
}

export {organizationsPage};