const handleErrors = (err, req, res, next) => {
        const status = err.status || 500;
        const message = err.message || 'Internal Server Error';
    
        res.status(status).render('errors/error', {
            title: `${status} - Error`,
            status,
            message
        });
    };