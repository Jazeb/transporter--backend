const _ = require('lodash');
const uuid = require('uuid');
const validator = require("email-validator");

const { encryptPassword, generateToken, isValidPassword } = require('../../utils/shared');
const userService = require('../services/user.services');
const mailer = require("../../config/mailer");
const resp = require('../../config/api.response');
const view = require('../../utils/views');
const fcm = require('../../../pushNotifications');

module.exports = {
    login,
    logout,
    get,
    userSignup,
    changePassword,
    forgotPassword,
    placeService,
    startService,
    endService,
    acceptServiceOrder,
    submitReview,
    getCustomerOrders,
    cancelService,
    getNotifications,
    getVendorOrders,
    arrivedOrderUpdate,
    updateFCM,
    getOrderById,
    uploadDocuments,
    addVehicle,
    updateVendor,
    addContactUs,
    sendVendorOtp
}

function uploadDocuments(req, res) {
    const docs = req.files;
    const user = req.user;

    if(!docs)
        return resp.error(res, 'Docs not provided');

    let doc_names = ['cnic_front', 'cnic_back', 'licence_front', 'licence_back'];
    let user_docs = {};

    for (let key in docs) {
        if (doc_names.includes(key) && Object.hasOwnProperty.call(docs, key)) {
            let ele = docs[key];

            let ext = ele.name.replace(' ', '_').split('.').reverse()[0];
            let fileName = uuid.v1() + '.' + ext;

            let dest_url = process.cwd() + '/server/assets/docs/' + fileName;

            ele.mv(dest_url);
            user_docs[key] = fileName;
        }
    }

    userService.updateDocuments(user_docs, user.id)
        .then(_ => resp.success(res, user_docs))
        .catch(err => resp.error(res, 'Error updating documentation', err))

}

function logout(req, res) {
    let { id } = req.user;
    let model = req.url == '/vendor/logout' ? 'VENDOR' : 'CUSTOMER';

    userService.updateLogout(id, model)
        .then(_ => resp.success(res, 'Logout success'))
        .catch(err => resp.error(res, 'Something went wrong', err));
}

async function acceptServiceOrder(req, res) {
    try {
        const { order_id, status } = req.body;
        const user_id = req.user.id;

        if (!order_id || !status) return resp.error(res, 'Provide required fields');

        if (!['ACCEPT', 'REJECT'].includes(status))
            return resp.error(res, 'Invalid status provided');

        const order = await view.find('ORDER', 'id', order_id);
        if (_.isEmpty(order) || order.state !== 'PENDING' || order.status !== 'PENDING')
            return resp.error(res, `Order status is already ${order.status}`);

        let customer = await view.find('CUSTOMER', 'id', order.customer_id);


        let data = {
            order_id,
            customer,
            vendor_id: user_id,
            vendor: req.user,
            state: `${status}ED`,
            customer_id: order.customer_id
        }

        const notif_data = {
            user_id,
            message: `Job ${status}ED`
        }

        if (status == 'REJECT') {
            data['rejected_by_id'] = user_id;
            data['order_status'] = 'REJECTED';
            data['rejected_by'] = req.user.user_type;
        }
        else if (status == 'ACCEPT') {
            data['order_status'] = 'ON_THE_WAY';
            data['accepted_by'] = user_id;

            notif_data['user_id'] = order.customer_id;
        }

        sendOrderSubscription(data);

        const promises = [
            userService.addVendorNotification(notif_data),
            userService.addCustomerNotification(notif_data),
            userService.updateOrders(data)
        ]

        await Promise.all(promises);

        return resp.success(res, data);

        data.customer = customer;

        let vendor_name = req.user.first_name + ' ' + req.user.last_name;
        let fcm_obj = {
            reg_id: customer.fcm_token,
            title: `Order is ${status}ED by the Vendor`,
            body: `You order is ${status}ED by the vendor ${vendor_name}`
        }
        return await fcm.sendNotification(fcm_obj);

    } catch (error) {
        console.error(error.message);
        return resp.error(res, 'Something went wrong', error);
    }
}

async function arrivedOrderUpdate(req, res) {
    try {
        const { order_id } = req.body;
        if (!order_id) return resp.error(res, 'Provide order id');

        const user_id = req.user.id;

        const order = await view.find('ORDER', 'id', order_id);
        if (_.isEmpty(order) || order.state !== 'ACCEPTED' || order.status !== 'PENDING' || order.accepted_by !== user_id)
            return resp.error(res, `Order status is already ${order.status}`);

        resp.success(res, 'vendor arrived event sent');

        let data = {
            order_id,
            vendor: req.user,
            state: order.state,
            accepted_by: user_id,
            vendor_id: user_id,
            // vendor_status: 'ARRIVED',
            order_status: 'ARRIVED',
            customer_id: order.customer_id
        }

        sendOrderSubscription(data);

        let notif_data = {
            user_id,
            message: 'Your vendor has arrived'
        }
        await userService.addVendorNotification(notif_data);

        notif_data.user_id = user_id;
        await userService.addCustomerNotification(notif_data);

        let customer = await view.find('CUSTOMER', 'id', order.customer_id);

        let vendor_name = req.user.first_name + ' ' + req.user.last_name;
        let fcm_obj = {
            reg_id: customer.fcm_token,
            title: `Vendor has arrived`,
            body: `Your vendor ${vendor_name} arrived at your destination`
        }

        return await fcm.sendNotification(fcm_obj);

    } catch (error) {
        console.error(error);
        return resp.error(res, 'Something went wrong', error);
    }
}

async function startService(req, res) {
    try {
        const { order_id } = req.body;
        const user_id = req.user.id;
        if (!order_id) return resp.error(res, 'Provide required fields');

        const order = await view.find('ORDER', 'id', order_id);
        if (_.isEmpty(order) || order.state !== 'ACCEPTED' || order.status !== 'PENDING')
            return resp.error(res, `Order status is already ${order.status}`);

        let should_return = false;

        if (order.accepted_by !== user_id)
            return resp.error(res, 'This order is accepted by another vendor');

        const data = {
            order_id,
            status: 'ONGOING',
            customer_id: order.customer_id,
            order_status: 'ONGOING',
            // vendor_status: 'ARRIVED',
            started_at: Date.now()
        }
        userService.updateOrders(data)
            .then(_ => resp.success(res, 'Order is started'))
            .catch(err => {
                resp.error(res, 'Something went wrong', err);
                should_return = true;
            });

        if (should_return) return;

        sendOrderSubscription(data);

        let notif_data = {
            user_id,
            message: 'Your job started'
        }

        await userService.addVendorNotification(notif_data);

        notif_data.user_id = user_id;

        await userService.addCustomerNotification(notif_data);

        let customer = await view.find('CUSTOMER', 'id', order.customer_id);

        let vendor_name = req.user.first_name + ' ' + req.user.last_name;
        let fcm_obj = {
            reg_id: customer.fcm_token,
            title: `Order is started`,
            body: `You order is started by the vendor ${vendor_name}`
        }

        return await fcm.sendNotification(fcm_obj);

    } catch (error) {
        console.error(error);
        return resp.error(res, 'Something went wrong', error);
    }
}

async function endService(req, res) {
    try {
        let should_return = false;
        const { order_id } = req.body;
        if (!order_id)
            return resp.error(res, 'Provide required fields');

        const user_id = req.user.id;
        const order = await view.find('ORDER', 'id', order_id);
        if (_.isEmpty(order) || order.state !== 'ACCEPTED')
            return resp.error(res, `Order status is already ${order.status}`);

        const data = {
            order_id,
            price: order.price,
            tax: order.tax,
            total_price: order.total_price,
            completed_at: Date.now(),
            vendor_id: order.vendor_id,
            accepted_by: order.vendor_id,
            order_status: 'COMPLETED',
            status: 'COMPLETED',
            customer_id: order.customer_id
        }

        if (req.user.user_type == 'VENDOR') {
            data.completed_by_vendor = true
        } else {
            data.completed_by_customer = true;
        }

        sendOrderSubscription(data);

        userService.updateOrders(data)
            .then(_ => resp.success(res, 'Order is completed'))
            .catch(err => {
                resp.error(res, 'Something went wrong', err);
                should_return = true;
            });

        if (should_return) return;

        let notif_data = {
            user_id,
            message: 'Your job has been completed'
        }

        await userService.addVendorNotification(notif_data);

        notif_data.user_id = user_id;

        await userService.addCustomerNotification(notif_data);

        let customer = await view.find('CUSTOMER', 'id', order.customer_id);

        let vendor_name = req.user.first_name + ' ' + req.user.last_name;
        let fcm_obj = {
            reg_id: customer.fcm_token,
            title: `Your order is completed`,
            body: `Your vendor ${vendor_name} has marked your order as completed`
        }

        return await fcm.sendNotification(fcm_obj);

    } catch (error) {
        console.error(error);
        return resp.error(res, 'Something went wrong', error);
    }
}

// cancel service order
async function cancelService(req, res) {
    const { order_id, reason } = req.body;
    if (!order_id || !reason) return resp.error(res, 'Provide required fields');

    try {
        const curr_order = await view.find('ORDER', 'id', order_id);
        if (_.isEmpty(curr_order) || ['COMPLETED', 'CANCELLED'].includes(curr_order.status))
            return resp.error(res, 'Cannot cancel already completed order');

        const user_id = req.user.id;
        const data = {
            reason,
            order_id,
            status: 'CANCELLED',
            order_status: 'CANCELLED',
            cancelled_by_id: user_id,
            cancelled_by: req.user.user_type
        }

        let notif_data = {
            user_id,
            message: 'Your job has been cancelled'
        }

        await userService.addVendorNotification(notif_data);

        notif_data.user_id = user_id;

        await userService.addCustomerNotification(notif_data);

        userService.updateOrders(data)
            .then(_ => sendOrderSubscription(data))
            .then(_ => resp.success(res, 'Order cancelled'))
            .catch(err => resp.error(res, 'Error updating service order', err));

    } catch (err) {
        console.error(err);
        return resp.error(res, 'Error updating service order', err);
    }
}

function sendOrderSubscription(data) {
    let pubsub = require('../../graphql/pubsub');
    return pubsub.publish('ORDER_STATUS', { ORDER_STATUS: data });
}

// function orderCancelSub(data) {
//     let pubsub = require('../../graphql/pubsub');

//     pubsub.publish('ORDER_CANCEL', {
//         ORDER_CANCEL: { order_id: data.order_id, vendor_id: data.vendor_id }
//     });
// }

// function orderAcceptedSub(data) {
//     let pubsub = require('../../graphql/pubsub');

//     pubsub.publish('ORDER_ACCEPTED', {
//         ORDER_ACCEPTED: { customer_id: data.customer_id, order_id: data.order_id, vendor_id: data.vendor_id, accepted_by:data.accepted_by }
//     });
// }

async function placeService(req, res) {
    try {
        const pubsub = require('../../graphql/pubsub');
        const body = req.body;

        const { source_lat, source_lon, destination_lat, destination_lon, vehicle_id, capacity, payment_method } = body;
        if (!(source_lat && source_lon && destination_lat && destination_lon && vehicle_id && capacity && payment_method))
            return resp.error(res, 'Provide required fields');

        body['customer_id'] = req.user.id;
        body['vehicle_id'] = vehicle_id;

        const response = (await userService.saveService(body)).toJSON();

        response['customer'] = req.user;

        pubsub.publish('NEW_JOB_ALERT', {
            NEW_JOB_ALERT: response
        });

        const fcm_obj = {
            reg_id: req.user.fcm_token,
            title: 'Order placed successfully',
            body: `Your order has been successfully placed`
        }

        resp.success(res, response, 'Order placed successfully');
        return await fcm.sendNotification(fcm_obj);

    } catch (error) {
        console.log(error);
        return resp.error(res, 'Error placing service order');
    }
}

async function sendVendorOtp(req, res) {
    try {
        const { email } = req.body;
        if (!email)
            return resp.error(res, 'Provide email in the body');

        const is_exist = await view.find('VENDORS_OTP', 'email', email)

        if (is_exist && is_exist.is_verified)
            return resp.error(res, 'This email is already verified');

        const data = { email }
        const otp = await mailer.sendOtp(data);

        if (!is_exist) await userService.addVendorOtp({ email, otp });
        else await userService.updateVendorOtp({ email, otp, is_verified: false });

        return resp.success(res, { otp });

    } catch (err) {
        console.error(err);
        return resp.error(res, 'Error sending OTP', err);
    }
}


async function userSignup(req, res) {
    try {
        const model = req.url == '/vendor/signup' ? 'VENDOR' : 'CUSTOMER';
        let already_exists = await view.find(model, 'email', req.body.email);

        if (!_.isEmpty(already_exists) && already_exists.phone_no == req.body.phone_no)
            return resp.error(res, 'User already exists with this email or phone');

        const user = req.body;
        if (user.password) {
            if (user.confirm_password && user.password !== user.confirm_password)
                return resp.error(res, 'Password does not match');

            user.password = encryptPassword(user.password);
        }

        if (req.files && req.files.profile_image) {
            let image = req.files.profile_image;
            let fileName = image.name.replace(' ', '_').split('.').reverse()[0];
            fileName = '/image_' + Date.now() + '.' + fileName;

            let dest_url = process.cwd() + '/server/assets/profile_images' + fileName;
            image.mv(dest_url);
            user.image_url = fileName;
        }

        let new_user = model == 'VENDOR'
            ? await userService.vendorSignup(user)
            : await userService.customerSignup(user);

        new_user = new_user.toJSON();
        new_user.user_type = model;

        delete new_user.created_at;
        delete new_user.updated_at;

        const token = generateToken(new_user);
        new_user.token = token;
        new_user && resp.success(res, new_user);
        return
    } catch (err) {
        console.error(err);
        return resp.error(res, 'Error adding user', err);
    }
}

async function get(req, res) {

    try {
        let user = await view.find({ table_name: 'USERS', key: 'id', value: req.user.id });
        if (_.isEmpty(user))
            return resp.error(res, 'Invalid user id');

        user = user.toJSON();
        const coins = await view.find({ table_name: 'UserCoins', key: 'user_id', value: req.user.id });
        delete user.password
        user.coins = coins || {}
        user && resp.success(res, user);
        return
    } catch (err) {
        console.error(err);
        return resp.error(res, 'Error getting user', err);
    }
}

async function login(req, res) {
    try {
        let user = {}
        const model = req.url == '/vendor/login' ? 'VENDOR' : 'CUSTOMER';
        if (model == 'CUSTOMER') {
            user = await view.find(model, 'phone_no', req.body.phone_no);
            if (_.isEmpty(user))
                return resp.error(res, 'Invalid user');

        }
        else {
            const { email, password } = req.body;

            if (!validator.validate(email))
                return resp.error(res, 'Provide a valid email');

            if (_.isEmpty(password))
                return resp.error(res, 'Provide required fields');

            user = await view.find(model, 'email', email);
            if (_.isEmpty(user))
                return resp.error(res, 'Invalid user');

            let isValid = await isValidPassword(password, user.password);
            if (!isValid)
                return resp.error(res, 'Invalid password');
        }

        delete user.password;
        delete user.created_at;
        delete user.updated_at;

        user.user_type = model;
        let token = generateToken(user);
        user.token = token;
        return resp.success(res, user);
    } catch (err) {
        console.error(err)
        return resp.error(res, 'Something went wrong', err);
    }
}

/*async function resetPassword(req, res) {
    try {
        const { old_password, new_password } = req.body;
        if (_.isEmpty(new_password) || _.isEmpty(old_password))
            return resp.error(res, 'Provide required fields');

        const id = req.user.id
        const user = await view.findOne({ table_name: 'USERS', where: { id } });
        let isValid = await isValidPassword(old_password, user.password);

        if (!isValid)
            return resp.error(res, 'Invalid old password, please try again');

        const update_password = await userService.resetPassword(id, new_password);
        update_password && resp.success(res, 'Password updated successfully');
        return
    } catch (err) {
        console.error(err)
        return resp.error(res, 'Error updating password', err)
    }
}*/

async function changePassword(req, res) {

    try {
        const { old_password, new_password, confirm_password } = req.body;
        if (_.isEmpty(old_password) || _.isEmpty(new_password) || _.isEmpty(confirm_password))
            return resp.error(res, 'Provide required fields');

        const table_name = req.url == '/vendor/changePassword' ? 'VENDOR' : 'CUSTOMER';
        const curr_user = await getUser('id', req.user.id, table_name);
        if (!curr_user)
            return resp.error(res, 'Invalid id');

        let isValid = await isValidPassword(old_password, curr_user.password);
        if (!isValid)
            return resp.error(res, 'Invalid current password');

        if (new_password !== confirm_password)
            return resp.error(res, 'Password must match');

        userService.resetPassword(req.user.id, new_password, table_name).then(_ => resp.success(res, 'Password updated successfully'))
            .catch(err => {
                console.error(err);
                return resp.error(res, 'Error updating password', err);
            });

    } catch (error) {
        console.error(error);
        return resp.error(res, 'Error updating password', error);
    }
}

async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        if (_.isEmpty(email))
            return resp.error(res, 'Provide email');

        const table_name = req.url == '/vendor/forgotPassword' ? 'VENDOR' : 'CUSTOMER';
        const curr_user = await getUser('email', email, table_name);
        if (!curr_user)
            return resp.error(res, 'Invalid email');

        mailer.sendForgotEmail(curr_user).then(_ => resp.success(res, 'Email sent successfully')).catch(err => {
            console.error(err);
            return resp.error(res, 'Error sending email', err);
        });

    } catch (error) {
        console.error(error);
        return resp.error(res, 'Error sending email', error);
    }
}

function getUser(key, value, table_name) {
    return new Promise((resolve, reject) => {
        view.find(table_name, key, value).then(user => resolve(user))
            .catch(err => reject(err));
    });
}

function submitReview(req, res) {
    try {
        const { stars, review, order_id } = req.body;
        if (!stars || !review || !order_id)
            return resp.error(res, 'Provide required fields');

        const data = { stars, review, order_id };
        const { user_type } = req.user;

        data['order_id'] = order_id;
        user_type == 'VENDOR' ? data['customer_id'] = req.user.id : data['vendor_id'] = req.user.id;


        if (user_type == 'VENDOR') {
            userService.addCustomerReview(data)
                .then(_ => resp.success(res, 'Reviews submitted successfully'))
                .catch(err => resp.error(res, 'Error submitting review', err));
        }
        else {
            userService.addVendorReview(data)
                .then(_ => resp.success(res, 'Reviews submitted successfully'))
                .catch(err => resp.error(res, 'Error submitting review', err));
        }

    } catch (error) {
        console.error(error);
        return resp.error(res, 'Error addming review', error);
    }
}

// const stringToBoolean = string => string === 'false' ? false : !!string;

/* function updateLocation(req, res) {
    const { lat, lon } = req.body;
    if (!lat || !lon) return resp.error(res, 'Provide lat and lon');

    const user = req.user;
    const data = {
        lat, lon,
        user_id: user.id,
    }
    userService.updateLocation(data)
        .then(sendsubscriptionEvent(data))
        .then(_ => resp.success(res, 'Location updated'))
        .catch(err => resp.error(res, 'Error updating location', err));
}

function sendsubscriptionEvent(data) {
    const pubsub = require('../../graphql/pubsub');

    pubsub.publish('LOCATION_UPDATE', {
        LOCATION_UPDATE: data
    });
} */

function getCustomerOrders(req, res) {
    const user_id = req.user.id;
    userService.getOrdersByCustomer(user_id)
        .then(orders => resp.success(res, orders))
        .catch(err => resp.error(res, 'Error getting orders', err));
}

function getVendorOrders(req, res) {
    const user_id = req.user.id;
    userService.getOrdersByVendor(user_id)
        .then(orders => resp.success(res, orders))
        .catch(err => resp.error(res, 'Error getting orders', err));
}

function getNotifications(req, res) {
    let id = req.user.id;
    let user_type = req.user.user_type;

    userService.getNotifications(id, user_type)
        .then(notifications => resp.success(res, notifications))
        .catch(err => resp.error(res, 'Error getting notifications', err));
}

function updateFCM(req, res) {
    let fcm_token = req.body.fcm_token;
    if (!fcm_token) return resp.error(res, 'Provide FCM Token');

    let { user_type, id } = req.user;
    userService.updateFCM(user_type, fcm_token, id)
        .then(_ => resp.success(res, 'FCM Token updated successfully'))
        .catch(err => resp.error(res, 'Somthing went wrong', err.message));

}


function getOrderById(req, res) {
    const { order_id } = req.params;
    userService.getOrder(order_id).then(result => resp.success(res, result))
        .catch(err => resp.error(res, 'Somthing went wrong', err.message));
}

function addVehicle(req, res) {
    let id = req.user.id;
    userService.addVehicle(req.body, id).then(_ => resp.success(res, 'Vehicle added successfully'))
        .catch(err => resp.error(res, 'error adding vehicle', err.message));
}

async function updateVendor(req, res) {
    try {
        const body = req.body;

        if (req.files && req.files.profile_image) {
            let file = req.files.profile_image;

            let ext = file.name.replace(' ', '_').split('.').reverse()[0];
            let fileName = uuid.v1();

            let dest_url = process.cwd() + '/server/assets/profile_picture/' + fileName + '.' + ext;

            file.mv(dest_url);
        }

        body['id'] = req.user.id;

        await userService.updateVendors(body);
        return resp.success(res, body);

    } catch (err) {
        console.log(err);
        return resp.error(res, 'Error updating Vendors', err.message);
    }

}

function addContactUs(req, res) {
    const body = req.body;
    if (!body) return resp.error(res, 'Body is empty');
    body.user_type = req.user.user_type;
    userService.addContactUs(body).then(_ => resp.success(res, 'Request submitted successfully.'))
        .catch(err => resp.error(res, 'Request failed', err.message));
}