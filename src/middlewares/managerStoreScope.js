const AppError = require('../utils/AppError');
const ROLES = require('../constants/roles');

const managerStoreScope = (paramName = 'storeId') => (req, res, next) => {
    const { user } = req;
    if (!user) return next(new AppError('Authentification requise', 401));


    if (user.role === ROLES.ADMIN) return next();

    if (user.role === ROLES.MANAGER) {
        if (!user.store)
            return next(new AppError('Aucun magasin assigné à ce gestionnaire', 403));

        const managerStore = user.store.toString();
        const requested = req.params[paramName];

        if (requested && requested !== managerStore)
            return next(new AppError('Accès refusé à ce magasin', 403));

        req.storeScope = managerStore;
        return next();
    }


    return next(new AppError('Accès refusé', 403));
};
