export default (sequelize, dataTypes) => {
    const model = sequelize.define('productOrder', {
        amount: {
            type: dataTypes.NUMBER,
            allowNull: false,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsTo(models.order, {foreignKey: {primaryKey: true}});
        model.belongsTo(models.product, {foreignKey: {primaryKey: true}});
    };

    return model;
};
