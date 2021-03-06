import express from 'express';
import authController from '../controller/auth';
import asyncWrapper from '../util/asyncWrapper';
import authenticatedMiddleware from '../middleware/authenticated';

const router = express.Router();

router.post('/register', asyncWrapper(async (req, res) => {
    const controllerResponse = await authController.register(req.body.email, req.body.password);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

router.post('/login', asyncWrapper(async (req, res) => {
    const controllerResponse = await authController.login(req.body.email, req.body.password);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

router.post('/logout', authenticatedMiddleware(), asyncWrapper(async (req, res) => {
    const controllerResponse = await authController.logout(req.requestingAuthToken.id);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

router.post('/change-password', asyncWrapper(async (req, res) => {
    const controllerResponse = await authController.changePassword(req.body.email, req.body.oldPassword, req.body.newPassword);
    res.status(controllerResponse.status).send(controllerResponse.body);
}));

router.get('/who-am-i', authenticatedMiddleware(), (req, res) => {
    const controllerResponse = authController.whoAmI(req.requestingUser);
    res.status(controllerResponse.status).send(controllerResponse.body);
});

export default router;
