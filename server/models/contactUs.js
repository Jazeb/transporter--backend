module.exports = function (sequelize, DataTypes) {
    return sequelize.define('contactUs', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        first_name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        message: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    }, {
        sequelize,
        tableName: 'contactUs',
        timestamps: false
    });
}