// Test route for 500 errors
const testErrorPage = (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
};

// Export any controller functions
export { testErrorPage };

const handleErrors = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).render('errors/error', {
        title: `${status} - Error`,
        status,
        message
    });
};

export { handleErrors };