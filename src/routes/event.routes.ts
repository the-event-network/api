import { Router } from "express";
import * as eventController from "../controllers/event.controller";
import validateUser from "../middleware/auth";

const router = Router();

router.get("/", eventController.getEvents);
router.post("/", validateUser, eventController.createNewEvent);
router.post("/enroll", validateUser, eventController.enroll);
router.get("/created", validateUser, eventController.getCreatedEvents);
router.get("/my-events", validateUser, eventController.getUserEvents);
router.get("/recommended", validateUser, eventController.getRecommendedEvents);
router.get("/search", eventController.getEventsByQuery);
router.get("/search/category", eventController.getEventsByCategory);
router.get("/search/user", eventController.getEventsByUsername);
router.delete(
  "/stop-participating/:eventId",
  validateUser,
  eventController.removeUserEvent,
);
router.get("/:id", eventController.getEvent);
router.delete("/:id", validateUser, eventController.deleteEvent);
router.get("/:id/can-update", validateUser, eventController.checkUpdate);
router.put("/:id", validateUser, eventController.updateEventData);
router.get("/:id/rating", validateUser, eventController.userRating);
router.get("/:id/organizer-rating", eventController.organizerRating);
router.post("/:id/rate", validateUser, eventController.rateEvent);

export default router;
