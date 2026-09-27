const homePage = async(req, res) => {
    const template = 'home';
    const title = 'Home';
    res.render(template, {title});
}

export {homePage};