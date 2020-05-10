import dependencyInjector from '../util/dependencyInjector';
import controllerResponse from '../util/controllerResponse';
import validationUtil from '../util/validation';

async function setStatus(requestingUser, userEmail, isStudent, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!requestingUser || !requestingUser.admin) {
        return controllerResponse(true, 403);
    }

    if (!validationUtil.isEmail(userEmail)) {
        return controllerResponse(true, 400, 'validation/userEmail');
    }

    if (!validationUtil.isBool(isStudent)) {
        return controllerResponse(true, 400, 'validation/isStudent');
    }

    const [updatedRowsCount] = await dependencies.db.models.customer.update({
        isStudent: isStudent,
    }, {
        where: {
            userEmail: userEmail,
        },
    });

    if (updatedRowsCount === 0) {
        return controllerResponse(true, 404, 'existance/userEmail');
    }

    return controllerResponse(false);
}

export default {
    setStatus,
};