const Sequelize = require("sequelize");

const sequelize = require('../config/db.connection');
const db = { Sequelize, sequelize };

Vendors = require('./vendors')(sequelize, Sequelize);
Vehicles = require('./vehicles')(sequelize, Sequelize);
Customers = require('./customers.js')(sequelize, Sequelize);
ServiceOrders = require('./services_orders')(sequelize, Sequelize);
VendorsReviews = require('./vendor_reviews')(sequelize, Sequelize);
CustomersReviews = require('./customer_reviews')(sequelize, Sequelize);
Notifications = require('./notifications')(sequelize, Sequelize);
Admin = require('./admin')(sequelize, Sequelize);
ContactUs = require('./contactUs')(sequelize, Sequelize);
VendorOtps = require('./vendorOtps')(sequelize, Sequelize);


// VendorOtps.sync({ alter: true }).then(s => console.log(s)).catch(err => console.error(err));

ServiceOrders.hasOne(Vehicles, {
    foreignKey: 'vehicle_id',
    targetKey: 'id'
});

ServiceOrders.belongsTo(Customers, {
    foreignKey: 'service_id',
    targetKey: 'id'
});

ServiceOrders.belongsTo(Vendors, {
    foreignKey: 'service_id',
    targetKey: 'id'
});

Customers.hasMany(ServiceOrders, {
    foreignKey: 'customer_id',
    targetKey: 'id'
});

Vendors.hasMany(ServiceOrders, {
    foreignKey: 'vendor_id',
    targetKey: 'id'
});


module.exports = { db, Admin, VendorOtps, Customers, Vendors, Vehicles, ServiceOrders, CustomersReviews, VendorsReviews, Notifications, ContactUs };
