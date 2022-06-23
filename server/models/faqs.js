module.exports = function (sequelize, DataTypes) {
    return sequelize.define('FAQs', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        question: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        answer: {
            type: DataTypes.STRING(200),
            allowNull: false
        }
    }, {
        sequelize,
        tableName: 'FAQs',
        timestamps: true
    });
}