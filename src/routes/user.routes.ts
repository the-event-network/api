import { Router } from "express";
import * as userController from "../controllers/user.controller";
import validateUser from "../middleware/auth";

const router = Router();

router.post("/invite", validateUser, userController.inviteUsers);
router.post("/login", userController.login);
router.post("/signup", userController.signup);
router.post("/preferences", validateUser, userController.addPreferences);
router.get("/", userController.getUsers);
router.get("/find-email", userController.findByEmail);
router.get("/me", validateUser, userController.me);
router.put("/", validateUser, userController.updateUser);
router.post("/add-friend", validateUser, userController.addFriend);
router.put("/remove-friend/:id", userController.removeUserFriend);
router.get("/friends", validateUser, userController.getUserFriends);
router.get("/:id", userController.getUser);

export default router;
