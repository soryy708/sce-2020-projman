import Sequelize from 'sequelize';
import models from './model';
import cryptoUtil from '../util/crypto';

if (process.env.NODE_ENV === 'production') {
    if (!process.env.DB_HOST) {
        throw new Error('Undefined environment variable: DB_HOST');
    }
    
    if (!process.env.DB_NAME) {
        throw new Error('Undefined environment variable: DB_NAME');
    }
    
    if (!process.env.DB_USERNAME) {
        throw new Error('Undefined environment variable: DB_USERNAME');
    }
    
    if (!process.env.DB_PASSWORD) {
        throw new Error('Undefined environment variable: DB_PASSWORD');
    }
}

const dbConfig = {
    dialect: process.env.DB_DIALECT || 'sqlite',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    logging: (message) => console.log(message),
};
if (dbConfig.dialect === 'sqlite') {
    dbConfig.storage = 'db.sqlite';
}

const db = {
    Sequelize: Sequelize,
    models: models,
    sequelize: null,
};

async function init() {
    if (dbConfig.dialect === 'sqlite') {
        db.sequelize = new Sequelize(dbConfig);
    } else {
        db.sequelize = new Sequelize(dbConfig.name, dbConfig.username, dbConfig.password, dbConfig);
    }
    
    Object.keys(db.models).forEach(modelName => {
        const modelDef = db.models[modelName];
        const model = modelDef(db.sequelize, Sequelize);
        db.models[modelName] = model;
    });
    Object.keys(db.models).forEach(modelName => {
        const model = db.models[modelName];
        if (model.associate) {
            model.associate(db.models);
        }
    });
    
    await db.sequelize.authenticate();
    await db.sequelize.sync();

    console.log('Done initializing database');

    const registeredUsers = await db.models.user.count();
    if (registeredUsers === 0) {
        console.log('Creating default user');
        await db.sequelize.transaction(async transaction => {
            const defaultEmail = 'admin@supersami.co.il';
            await Promise.all([
                db.models.user.create({
                    email: defaultEmail,
                    password: await cryptoUtil.hash('Sami123456', 10),
                }, {transaction}),
                db.models.admin.create({
                    userEmail: defaultEmail,
                }, {transaction}),
            ]);
        });
    }
}

init();

export default db;
