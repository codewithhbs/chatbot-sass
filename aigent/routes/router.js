const express = require("express");
const { googleLogin, register, login, getProfileData, logout } = require("../controller/authController");
const { verifyToken } = require("../middleware/authmiddleware");
const { check } = require("express-validator");
const { websiteSchemaEnter, checkMetaCode, get_my_chatBots, getMyChatBotDetailsBymetaCode, deleteChatBot } = require("../controller/WebsiteController");
const { create, getAll, getById, update, remove, addSubCategory, deleteSubCategory } = require("../controller/ServiceController");
const router = express.Router();

router.post("/google-login", googleLogin);
router.post("/register", register);
router.post("/login", login);
router.get("/dashboard-user", verifyToken, getProfileData);
router.get("/logout", verifyToken, logout);



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



module.exports = router;
