const resp = require('../../config/api.response');
const view = require('../../utils/views');

module.exports = {
    getServices,
    getVehicles
}


function getServices(req, res) {
    view.getServices()
        .then(services => resp.success(res, services))
        .catch(err => resp.error(res, 'Error getting services', err));
}

function getVehicles(req, res) {
    view.findAll('VEHICLES')
    .then(vehicles => resp.success(res, vehicles))
    .catch(err => resp.error(res, 'Error getting vehicles', err));
}