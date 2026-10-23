const AppError = require('../utils/AppError');
const ROLES = require('../constants/roles');

const managerStoreScope = (paramName = 'storeId') => (req, res, next) => {
    const { user } = req;
    if (!user) return next(new AppError('Authentification requise', 401));



};
