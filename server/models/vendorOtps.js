module.exports = function (sequelize, DataTypes) {
    return sequelize.define('vendorOtps', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING(50),
            unique: true,
            allowNull: false
        },
        otp: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        isVerified: {
            type: DataTypes.BOOLEAN(),
            defaultValue: false,
            allowNull: false
        }
    }, {
        sequelize,
        tableName: 'vendorOtps',
        timestamps: true
    });
}