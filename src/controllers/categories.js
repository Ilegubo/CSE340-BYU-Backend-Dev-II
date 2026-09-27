import { getAllCategories } from "../models/categories.js";

const categoriesPage = async (req, res) => {
    const categories =  await getAllCategories();
    const title = 'Categories';
    const template = 'categories';
    
    res.render(template, {title, categories});
}

export {categoriesPage};