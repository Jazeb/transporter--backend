module.exports = function (sequelize, DataTypes) {
    return sequelize.define('vendors', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        first_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        last_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        job_offered: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        // phone_no: {
        //     type: DataTypes.STRING(20),
        //     allowNull: false
        // },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        lat: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        lon: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        fcm_token: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        age: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        gender: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        user_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true
        },
        eta_no: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        vehicle_id: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        capacity: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        cnic_front: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        cnic_back: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        licence_front: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        licence_back: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        account_title: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        account_no: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        payment_type: {
            type: DataTypes.STRING(100),
            allowNull: true
        }
    }, {
        sequelize,
        tableName: 'vendors',
        timestamps: false
    });
}