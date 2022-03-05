module.exports = function (sequelize, DataTypes) {
    return sequelize.define('vehicles', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        vehicle_name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        image_url: {
            type: DataTypes.STRING(100),
            allowNull: true
        }
    }, {
        sequelize,
        tableName: 'vehicles',
        timestamps: true
    });
}