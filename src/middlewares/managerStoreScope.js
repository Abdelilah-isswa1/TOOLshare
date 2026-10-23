const AppError = require('../utils/AppError');
const ROLES = require('../constants/roles');

const managerStoreScope = (paramName = 'storeId') => (req, res, next) => {
    const { user } = req;
    if (!user) return next(new AppError('Authentification requise', 401));


    if (user.role === ROLES.ADMIN) return next();

    if (user.role === ROLES.MANAGER) {
        if (!user.store)
            return next(new AppError('Aucun magasin assigné à ce gestionnaire', 403));


};
