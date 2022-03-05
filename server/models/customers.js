module.exports = function (sequelize, DataTypes) {
    return sequelize.define('customers', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        first_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        phone_no: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        
        // password: {
        //     type: DataTypes.STRING(255),
        //     allowNull: false
        // },
        lat: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        lon: {
            type: DataTypes.STRING(20),
            allowNull: true
        }
    }, {
        sequelize,
        tableName: 'customers',
        timestamps: false
    });
}