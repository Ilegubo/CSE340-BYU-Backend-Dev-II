import {
    getAllCategories,
    getCategoryById,
    getCategoriesByProjectId,
    getProjectsByCategoryId
}
from "../models/categories.js";

const showCategoriesPage = async (req, res, next) => {
    try{
        const categories =  await getAllCategories();
        const title = 'Categories';
        const template = 'categories';
    res.render(template, {title, categories});
    } 
    catch(error) {
        next(error)
    }
    
}

const showCategoryDetailsPage = async (req, res, next) => {
    try{
        const template = 'category';
        const categoryId = req.params.id;

        const category = await getCategoryById(categoryId);

        if (!category) {
            const err = new Error('Category not found!');
            err.status = 404;
            return next(err);
        }
        const title = category.name;
        const projects = await getProjectsByCategoryId(categoryId);
            
        res.render(template, {title, category, projects});
    }
    catch(error){
        next(error);
    }
}

const showAssignCategoriesForm = async (req, res) => {
    const projectId = req.params.projectId;

    const projectDetails = await getProjectDetails(projectId);
    const categories = await getAllCategories();
    const assignedCategories = await getCategoriesByServiceProjectId(projectId);

    const title = 'Assign Categories to Project';

    res.render('assign-categories', { title, projectId, projectDetails, categories, assignedCategories });
};

const processAssignCategoriesForm = async (req, res) => {
    const projectId = req.params.projectId;
    const selectedCategoryIds = req.body.categoryIds || [];
    
    // Ensure selectedCategoryIds is an array
    const categoryIdsArray = Array.isArray(selectedCategoryIds) ? selectedCategoryIds : [selectedCategoryIds];
    await updateCategoryAssignments(projectId, categoryIdsArray);
    req.flash('success', 'Categories updated successfully.');
    res.redirect(`/project/${projectId}`);
};

export {
    showCategoriesPage,
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm
};