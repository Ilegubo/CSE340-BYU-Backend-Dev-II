import { getAllCategories, getCategoryById, getCategoriesByProjectId, getProjectsByCategoryId } from "../models/categories.js";

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

export {showCategoriesPage, showCategoryDetailsPage};