import assert from 'assert';
import moment from 'moment';
import authController from '../../../../src/api/controller/auth';
import cryptoUtil from '../../../../src/api/util/crypto';

describe('auth controller', () => {
    describe('register', () => {
        it('Checks that email is valid', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/email',
            };
            const actual = await authController.register('notAnEmail', 'SomePass123');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Checks that password is valid', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/password',
            };
            const actual = await authController.register('some@email.com', 'notapassword');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Checks if user exists', async () => {
            const expected = {
                error: true,
                status: 422,
                body: 'auth/existence',
            };
            const userEmail = 'some@email.com';
            const actual = await authController.register(userEmail, 'SomePass123', false, {
                db: {
                    models: {
                        user: {
                            findOrCreate: options => {
                                assert.strictEqual(options.where.email, userEmail);
                                return [{}, false];
                            },
                        },
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Creates a user', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const userEmail = 'some@email.com';
            const userPassword = 'SomePass123';
            const actual = await authController.register(userEmail, userPassword, false, {
                db: {
                    models: {
                        user: {
                            findOrCreate: async options => {
                                assert.strictEqual(options.defaults.email, userEmail);
                                assert.strictEqual(await cryptoUtil.compare(userPassword, options.defaults.password), true);
                                return [{
                                    email: userEmail,
                                }, true];
                            },
                        },
                        customer: {create: () => ({})},
                        authToken: {create: () => ({})},
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    
        it('Creates an associated admin if isAdmin=true', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const userEmail = 'some@email.com';
            const userPassword = 'SomePass123';
            let calledCreateAdmin = false;
            const actual = await authController.register(userEmail, userPassword, true, {
                db: {
                    models: {
                        user: {
                            findOrCreate: async options => {
                                assert.strictEqual(options.defaults.email, userEmail);
                                assert.strictEqual(await cryptoUtil.compare(userPassword, options.defaults.password), true);
                                return [{
                                    email: userEmail,
                                }, true];
                            },
                        },
                        admin: {
                            create: values => {
                                assert.strictEqual(values.userEmail, userEmail);
                                calledCreateAdmin = true;
                            },
                        },
                        authToken: {create: () => ({})},
                    },
                },
            });
            assert.strictEqual(calledCreateAdmin, true);
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    
        it('Creates an associated customer if isAdmin=false', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const userEmail = 'some@email.com';
            const userPassword = 'SomePass123';
            let calledCreateCustomer = false;
            const actual = await authController.register(userEmail, userPassword, false, {
                db: {
                    models: {
                        user: {
                            findOrCreate: async options => {
                                assert.strictEqual(options.defaults.email, userEmail);
                                assert.strictEqual(await cryptoUtil.compare(userPassword, options.defaults.password), true);
                                return [{
                                    email: userEmail,
                                }, true];
                            },
                        },
                        customer: {
                            create: values => {
                                assert.strictEqual(values.userEmail, userEmail);
                                calledCreateCustomer = true;
                            },
                        },
                        authToken: {create: () => ({})},
                    },
                },
            });
            assert.strictEqual(calledCreateCustomer, true);
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    
        it('Returns an authentication token', async () => {
            const uuidv4 = 'c3ce7179-1888-4dcc-a31f-8f9c7a79ba4e';
            const expected = {
                error: false,
                status: 200,
                body: { authToken: uuidv4 },
            };
            const userEmail = 'some@email.com';
            const userPassword = 'SomePass123';
            const actual = await authController.register(userEmail, userPassword, false, {
                db: {
                    models: {
                        user: {
                            findOrCreate: async options => {
                                assert.strictEqual(options.defaults.email, userEmail);
                                assert.strictEqual(await cryptoUtil.compare(userPassword, options.defaults.password), true);
                                return [{
                                    email: userEmail,
                                }, true];
                            },
                        },
                        customer: {create: () => ({})},
                        authToken: {create: () => ({ id: uuidv4 })},
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.deepStrictEqual(actual.body, expected.body);
        });
    });
    
    describe('login', () => {
        it('Checks that email is valid', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/email',
            };
            const actual = await authController.login('notAnEmail', 'SomePass123');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Checks that password is valid', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/password',
            };
            const actual = await authController.login('some@email.com', 'notapassword');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Checks if user exists', async () => {
            const expected = {
                error: true,
                status: 404,
                body: 'auth/generic',
            };
            const userEmail = 'some@email.com';
            let calledFindOne = false;
            const actual = await authController.login(userEmail, 'SomePass123', {
                db: {
                    models: {
                        user: {
                            findOne: options => {
                                assert.strictEqual(options.where.email, userEmail);
                                calledFindOne = true;
                                return null;
                            },
                        },
                    },
                },
            });
            assert.strictEqual(calledFindOne, true);
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Checks that password isn\'t too old', async () => {
            const expected = {
                error: true,
                status: 500,
                body: 'expiry/password',
            };
            const userEmail = 'some@email.com';
            const actual = await authController.login(userEmail, 'SomePass123', {
                db: {
                    models: {
                        user: {
                            findOne: options => {
                                assert.strictEqual(options.where.email, userEmail);
                                return {
                                    email: userEmail,
                                    passwordDate: new Date(0),
                                };
                            },
                        },
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Checks that passwords match', async () => {
            const expected = {
                error: true,
                status: 404,
                body: 'auth/generic',
            };
            const userEmail = 'some@email.com';
            const actual = await authController.login(userEmail, 'SomePass123', {
                db: {
                    models: {
                        user: {
                            findOne: async options => {
                                assert.strictEqual(options.where.email, userEmail);
                                return {
                                    email: userEmail,
                                    password: await cryptoUtil.hash('notTheRightPassword', 10),
                                    passwordDate: Date.now(),
                                };
                            },
                        },
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Returns an authentication token', async () => {
            const uuidv4 = 'c3ce7179-1888-4dcc-a31f-8f9c7a79ba4e';
            const expected = {
                error: false,
                status: 200,
                body: {authToken: uuidv4},
            };
            const userEmail = 'some@email.com';
            const userPassword = 'SomePass123';
            let createdAuthToken = false;
            const actual = await authController.login(userEmail, userPassword, {
                db: {
                    models: {
                        user: {
                            findOne: async options => {
                                assert.strictEqual(options.where.email, userEmail);
                                return {
                                    email: userEmail,
                                    password: await cryptoUtil.hash(userPassword, 10),
                                    passwordDate: Date.now(),
                                };
                            },
                        },
                        authToken: {
                            create: values => {
                                assert.strictEqual(values.userEmail, userEmail);
                                createdAuthToken = true;
                                return { id: uuidv4 };
                            },
                        },
                    },
                },
            });
            assert.strictEqual(createdAuthToken, true);
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.deepStrictEqual(actual.body, expected.body);
        });
    });
    
    describe('logout', () => {
        it('Checks that token exists', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/authToken',
            };
            const actual = await authController.logout(null, {});
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Checks that token is valid', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/authToken',
            };
            const actual = await authController.logout('someInvalidToken', {});
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        const mockSequelize = {
            Op: {
                or: '$or$',
                lte: '$lte$',
            },
        };
    
        it('Checks that matching token exists', async () => {
            const uuidv4 = 'c3ce7179-1888-4dcc-a31f-8f9c7a79ba4e';
            const expected = {
                error: true,
                status: 404,
                body: 'auth/token',
            };
            const actual = await authController.logout(uuidv4, {
                db: {
                    Sequelize: mockSequelize,
                    models: {
                        authToken: {
                            update: () => {
                                return [0];
                            },
                        }
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Checks sets matching token to inactive', async () => {
            const uuidv4 = 'c3ce7179-1888-4dcc-a31f-8f9c7a79ba4e';
            const expected = {
                error: false,
                status: 200,
            };
            let calledUpdate = false;
            const actual = await authController.logout(uuidv4, {
                db: {
                    Sequelize: mockSequelize,
                    models: {
                        authToken: {
                            update: (values, options) => {
                                assert.strictEqual(values.active, false);
                                assert.strictEqual(options.where[mockSequelize.Op.or].id, uuidv4);
                                assert.strictEqual(moment().diff(options.where[mockSequelize.Op.or].createdAt[mockSequelize.Op.lte], 'days'), 1);
                                calledUpdate = true;
                                return [1];
                            },
                        }
                    },
                },
            });
            assert.strictEqual(calledUpdate, true);
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    });
    
    describe('changePassword', () => {
        it('Checks that email is valid', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/email',
            };
            const actual = await authController.changePassword('notAnEmail', 'SomePass123', 'SomePass321');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
        
        it('Checks that oldPassword is valid', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/oldPassword',
            };
            const actual = await authController.changePassword('some@email.com', 'notapass', 'SomePass321');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Checks that newPassword is valid', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/newPassword',
            };
            const actual = await authController.changePassword('some@email.com', 'SomePass123', 'notapass');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
        
        it('Checks that oldPassword != newPassword', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/passwordsEqual',
            };
            const actual = await authController.changePassword('some@email.com', 'SomePass123', 'SomePass123');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Checks if user exists', async () => {
            const expected = {
                error: true,
                status: 404,
                body: 'auth/generic',
            };
            const userEmail = 'some@email.com';
            let calledFindOne = false;
            const actual = await authController.changePassword(userEmail, 'SomePass123', 'SomePass321', {
                db: {
                    models: {
                        user: {
                            findOne: options => {
                                assert.strictEqual(options.where.email, userEmail);
                                calledFindOne = true;
                                return null;
                            },
                        },
                    },
                },
            });
            assert.strictEqual(calledFindOne, true);
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Checks that oldPassword matches current', async () => {
            const expected = {
                error: true,
                status: 404,
                body: 'auth/generic',
            };
            const userEmail = 'some@email.com';
            const actual = await authController.changePassword(userEmail, 'SomePass123', 'SomePass321', {
                db: {
                    models: {
                        user: {
                            findOne: async options => {
                                assert.strictEqual(options.where.email, userEmail);
                                return {
                                    email: userEmail,
                                    password: await cryptoUtil.hash('notTheRightPassword', 10),
                                    passwordDate: Date.now(),
                                };
                            },
                        },
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Updates the password', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const userEmail = 'some@email.com';
            const oldPassword = 'SomePass123';
            const newPassword = 'SomePass321';
            const actual = await authController.changePassword(userEmail, oldPassword, newPassword, {
                db: {
                    models: {
                        user: {
                            findOne: async options => {
                                assert.strictEqual(options.where.email, userEmail);
                                return {
                                    email: userEmail,
                                    password: await cryptoUtil.hash(oldPassword, 10),
                                    passwordDate:  Date.now(),
                                };
                            },
                            update: async (values, options) => {
                                assert.strictEqual(options.where.email, userEmail);
                                assert.strictEqual(await cryptoUtil.compare(newPassword, values.password), true);
                            },
                        },
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    
        it('Updates the passwordDate', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const userEmail = 'some@email.com';
            const oldPassword = 'SomePass123';
            const newPassword = 'SomePass321';
            const oldPasswordDate = Date.now() - 100; // make sure this won't be equal to the new passwordDate, for example if the computer running the tests is too fast
            const actual = await authController.changePassword(userEmail, oldPassword, newPassword, {
                db: {
                    models: {
                        user: {
                            findOne: async options => {
                                assert.strictEqual(options.where.email, userEmail);
                                return {
                                    email: userEmail,
                                    password: await cryptoUtil.hash(oldPassword, 10),
                                    passwordDate: oldPasswordDate,
                                };
                            },
                            update: (values, options) => {
                                assert.strictEqual(options.where.email, userEmail);
                                assert.notStrictEqual(values.passwordDate, null);
                                assert.notStrictEqual(values.passwordDate, undefined);
                                assert.notStrictEqual(values.passwordDate, oldPasswordDate);
                            },
                        },
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    });
});
