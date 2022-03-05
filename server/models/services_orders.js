module.exports = function (sequelize, DataTypes) {
    return sequelize.define('services_orders', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        vehicle_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        capacity: {
            type: DataTypes.STRING(11),
            allowNull: true
        },
        note: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        rejected_by: {
            type: DataTypes.STRING(11),
            allowNull: true
        },
        rejected_by_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        cancelled_by_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        accepted_by: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM(['PENDING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
            allowNull: false,
            defaultValue: 'PENDING'
        },
        state: {
            type: DataTypes.ENUM(['PENDING', 'ACCEPTED', 'REJECTED']),
            allowNull: false,
            defaultValue: 'PENDING'
        },
        started_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
        completed_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
        price: {
            type: DataTypes.INTEGER(11)
        },
        tax: {
            type: DataTypes.INTEGER(11)
        },
        total_price: {
            type: DataTypes.INTEGER(11)
        },
        payment_method: {
            type: DataTypes.ENUM(['USD', 'ZWL', 'ECO'])
        },
        completed_by_vendor: {
            type: DataTypes.BOOLEAN(),
            defaultValue: false
        },
        completed_by_customer: {
            type: DataTypes.BOOLEAN(),
            defaultValue: false
        },
        source_lat: {
            type: DataTypes.STRING(11),
            allowNull: true
        },
        source_lon: {
            type: DataTypes.STRING(11),
            allowNull: true
        },
        destination_lat: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        destination_lon: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
    }, {
        sequelize,
        tableName: 'services_orders',
        timestamps: false
    });
}