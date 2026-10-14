// import { name } from 'ejs';
import db from './db.js'

const getAllCategories = async() => {
    const query = `
        SELECT category_id, name, description
        FROM public.categories;
    `;

    const result = await db.query(query);

    return result.rows;
}

const getCategoryById = async(categoryId) => {
    const query = `SELECT 
    name,
    description
    FROM public.categories
    WHERE
    category_id = $1`

    const queryParam = [categoryId];
    const result = await db.query(query,queryParam)

    return result.rows.length > 0 ? result.rows[0] : null;
} 


const getCategoriesByProjectId = async(projectId) => {
    const query = `SELECT 
        c.category_id,
        c.name,
        c.description
    FROM categories c
    JOIN project_categories pc ON c.category_id = pc.category_id
    WHERE pc.project_id = $1
    ORDER BY c.name ASC;`;

    const queryParams = [projectId];

    const result = await db.query(query, queryParams);

    return result.rows;
}

const getProjectsByCategoryId = async(categoryId) => {
    const query = `SELECT 
        p.project_id,
        p.organization_id,
        p.title,
        p.description,
        p.location,
        p.date,
        o.name AS organization_name
    FROM projects p
    JOIN project_categories pc ON p.project_id = pc.project_id
    JOIN organization o ON p.organization_id = o.organization_id
    WHERE pc.category_id = $1
    ORDER BY p.date ASC;`;

    const queryParams = [categoryId];
    const result = await db.query(query, queryParams);

    return result.rows;
}

const assignCategoryToProject = async (projectId, categoryId) => {
    const query = `
        INSERT INTO project_category (category_id, project_id)
        VALUES ($1, $2);
    `;

    await db.query(query, [categoryId, projectId]);
}

const updateCategoryAssignments = async(projectId, categoryIds) => {
    // First, remove existing category assignments for the project
    const deleteQuery = `
        DELETE FROM project_category
        WHERE project_id = $1;
    `;
    await db.query(deleteQuery, [projectId]);

    // Next, add the new category assignments
    for (const categoryId of categoryIds) {
        await assignCategoryToProject(categoryId, projectId);
    }
}

export {getAllCategories, getCategoryById, getCategoriesByProjectId, getProjectsByCategoryId, assignCategoryToProject, updateCategoryAssignments} 