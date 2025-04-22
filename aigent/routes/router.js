const express = require("express");
const { googleLogin, register, login, getProfileData, logout, addPasswordToMyProfile } = require("../controller/authController");
const { verifyToken } = require("../middleware/authmiddleware");
const { check } = require("express-validator");
const { websiteSchemaEnter, checkMetaCode, get_my_chatBots, getMyChatBotDetailsBymetaCode, deleteChatBot, updateChatBot } = require("../controller/WebsiteController");
const { create, getAll, getById, update, remove, addSubCategory, deleteSubCategory } = require("../controller/ServiceController");
const { get_my_booking, get_dashboard_data, deleteBooking, confirmBooking, cancelBooking, updateBookingDetails, getUniqueCustomersByMetaCode } = require("../controller/BookingController");
const router = express.Router();

router.post("/google-login", googleLogin);
router.post("/register", register);
router.post("/login", login);
router.get("/dashboard-user", verifyToken, getProfileData);
router.get("/logout", verifyToken, logout);
router.post("/update-password", verifyToken, addPasswordToMyProfile);



// Website routes
router.post(
    '/register-website',
    verifyToken,
    [
        check('website_name', 'Website name is required').not().isEmpty(),

        check('url', 'URL is required').not().isEmpty().isURL()
    ],
    websiteSchemaEnter
);
router.post('/check-meta-code', verifyToken, checkMetaCode)
router.delete('/delete-chatbot/:id', verifyToken, deleteChatBot)
router.post('/update-chatbot/:id', verifyToken, updateChatBot)
router.get('/get-my-chatbot', verifyToken, get_my_chatBots)
router.get('/my-chatbot', getMyChatBotDetailsBymetaCode)


//services
router.post("/service", verifyToken, create);
router.get("/service", verifyToken, getAll);
router.get("/service/:metaCode", getById);
router.put("/service/:id", update);
router.delete("/service/:id", remove);

router.post("/service/:id/subcategory", addSubCategory);
router.delete("/service/:serviceId/subcategory/:subCategoryIndex", deleteSubCategory);



//Booking and dashboard
router.get("/get-my-booking", get_my_booking);
router.get("/dashboard-data", get_dashboard_data);

router.delete('/booking-status/delete/:id', deleteBooking);
router.post('/booking-status/confirm/:id', confirmBooking);
router.post('/booking-status/cancel/:id', cancelBooking);
router.put('/booking-status/update/:id', updateBookingDetails);
router.get('/meta-user/:metaCode', verifyToken, getUniqueCustomersByMetaCode);

module.exports = router;
