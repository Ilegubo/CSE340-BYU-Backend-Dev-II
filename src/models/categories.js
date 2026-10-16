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
    category_id,
    name,
    description
    FROM public.categories
    WHERE
    category_id = $1;`;

    const queryParam = [categoryId];
    const result = await db.query(query, queryParam);

    return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Creates a new category in the database.
 * @param {string} name - The category name.
 * @param {string|null} description - Optional category description.
 * @returns {number|string} The ID of the created category.
 */
const createCategory = async (name, description = null) => {
    const query = `
        INSERT INTO categories (name, description)
        VALUES ($1, $2)
        RETURNING category_id;
    `;

    const queryParams = [name, description];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create category');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new category with ID:', result.rows[0].category_id);
    }

    return result.rows[0].category_id;
};

/**
 * Updates an existing category in the database.
 * Supports (categoryId, name, description) or (name, categoryId)
 * Throws an Error if no rows were updated.
 */
const updateCategory = async (...args) => {
    let categoryId, name, description;
    if (typeof args[0] === 'number' || (!isNaN(args[0]) && typeof args[1] === 'string')) {
        [categoryId, name, description] = args;
    } else {
        [name, categoryId, description] = args;
    }

    let query;
    let queryParams;
    if (description !== undefined && description !== null) {
        query = `
            UPDATE categories
            SET name = $1, description = $2
            WHERE category_id = $3
            RETURNING category_id, name, description;
        `;
        queryParams = [name, description, categoryId];
    } else {
        query = `
            UPDATE categories
            SET name = $1
            WHERE category_id = $2
            RETURNING category_id, name, description;
        `;
        queryParams = [name, categoryId];
    }

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to update category: category not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated category with ID:', result.rows[0].category_id);
    }

    return result.rows[0];
};

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
        INSERT INTO project_categories (category_id, project_id)
        VALUES ($1, $2);
    `;

    await db.query(query, [categoryId, projectId]);
}

const updateCategoryAssignments = async (projectId, categoryIds) => {
    // Deduplicate category IDs and ensure valid integers
    const uniqueCategoryIds = [...new Set(categoryIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id)))];

    // First, remove existing category assignments for the project
    const deleteQuery = `
        DELETE FROM project_categories
        WHERE project_id = $1;
    `;
    await db.query(deleteQuery, [projectId]);

    // Next, add the new category assignments
    for (const categoryId of uniqueCategoryIds) {
        await assignCategoryToProject(projectId, categoryId);
    }
};

export {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    getCategoriesByProjectId,
    getProjectsByCategoryId,
    assignCategoryToProject,
    updateCategoryAssignments
}; 