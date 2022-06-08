const express = require('express');

const { authCustomer, authVendor } = require("../../config/auth");
const userCrtl = require('../controllers/user.controller');
const ctrl = require('../controllers/services.controller');
const router = express.Router();

router.use('/vendor/profileImage', express.static(process.cwd() + '/server/assets/profile_images/'));
router.use('/vendor/documents', express.static(process.cwd() + '/server/assets/docs/'));

router.use('/customer/profileImage', express.static(process.cwd() + '/server/assets/profile_images/'));


// vendor APIs
router.post('/vendor/login', userCrtl.login);  // done
// router.post('/vendor/logout', authVendor, userCrtl.logout);
router.post('/vendor/signup', userCrtl.userSignup); // done

router.post('/vendor/documents', authVendor, userCrtl.uploadDocuments); // done
// router.put('/vendor/update', authVendor, userCrtl.updateUser);
// router.post('/vendor/review', authVendor, userCrtl.submitReview);

router.post('/vendor/vehicle', authVendor, userCrtl.addVehicle); // done
router.get('/vendor/vehicles', authVendor, ctrl.getVehicles); // done

router.put('/vendor/update', authVendor, userCrtl.updateVendor); // done

router.get('/vendor/vehices', ctrl.getVehicles); // done

router.post('/vendor/order/accept', authVendor, userCrtl.acceptServiceOrder); // send status = ACCEPTED 
router.post('/vendor/order/start', authVendor, userCrtl.startService); // send status = ARRIVED DONE
router.post('/vendor/order/arrived', authVendor, userCrtl.arrivedOrderUpdate); // send status = ARRIVED DONE
router.post('/vendor/order/end', authVendor, userCrtl.endService); // send status = COMPLETED
router.post('/vendor/order/cancel', authVendor, userCrtl.cancelService);


router.get('/vendor/notifications', authVendor, userCrtl.getNotifications); // done
router.get('/vendor/orders', authVendor, userCrtl.getVendorOrders); // done

router.post('/vendor/changePassword', authVendor, userCrtl.changePassword);   // done
router.post('/vendor/forgotPassword', userCrtl.forgotPassword);  // done
// router.post('/vendor/updateLocation', authVendor, userCrtl.updateLocation);

router.put('/vendor/updateFCM', authVendor, userCrtl.updateFCM); // done
router.post('/vendor/contactUs', authVendor, userCrtl.addContactUs);  // done

router.post('/vendor/sendOtp', userCrtl.sendVendorOtp);  // done
router.post('/vendor/payment', authVendor, userCrtl.addPaymentMethod);  // done

router.get('/vendor/jobs/:type', authVendor, userCrtl.getJobs);  // done


// customer APIs
// router.post('/customer/logout', authCustomer, userCrtl.logout);
router.put('/customer/update', authCustomer, userCrtl.updateCustomer);

router.post('/customer/signup', userCrtl.userSignup); // done
router.post('/customer/login', userCrtl.login);
router.post('/customer/review', authCustomer, userCrtl.submitReview); // done

router.post('/customer/order/place', authCustomer, userCrtl.placeService); // done
router.post('/customer/order/end', authCustomer, userCrtl.endService);
router.post('/customer/order/cancel', authCustomer, userCrtl.cancelService);
router.get('/customer/orders', authCustomer, userCrtl.getCustomerOrders);  // done
router.get('/customer/order/:order_id', authCustomer, userCrtl.getOrderById);  // done
router.get('/customer/notifications', authCustomer, userCrtl.getNotifications);
router.get('/customer/vehicles', authCustomer, ctrl.getVehicles); // done

router.put('/customer/updateFCM', authCustomer, userCrtl.updateFCM);
router.post('/customer/contactUs', authCustomer, userCrtl.addContactUs);  // done



module.exports = router;