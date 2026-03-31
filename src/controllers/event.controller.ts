import { Request, Response } from "express";
import handleError from "../utils/handleError";
import { UserOptions, CategoryOptions } from "../interfaces/options";
import * as eventService from "../services/event.service";
import * as userService from "../services/user.service";

export async function getEvents(req: Request, res: Response) {
  try {
    const events = await eventService.getEvents(req.query);
    res.status(200).send(events);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function createNewEvent(req: Request, res: Response) {
  try {
    const event = await eventService.createNewEvent(req.body, req.user);
    res.status(201).send(event);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function userRating(req: Request, res: Response) {
  try {
    const rating = await eventService.getUserRatingForEvent(
      req.user._id,
      req.params.id,
    );
    res.status(200).send({ rating });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function organizerRating(req: Request, res: Response) {
  try {
    const rating = await eventService.getOrganizerAvgRating(req.params.id);
    res.status(200).send({ rating });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function removeUserEvent(req: Request, res: Response) {
  try {
    await eventService.stopParticipating(req.user, req.params.eventId);
    res.status(200).send("Event deleted successfully");
  } catch (err) {
    return handleError(res, err);
  }
}

export async function enroll(req: Request, res: Response) {
  try {
    const event = await eventService.enroll(req.body.eventId, req.user._id);
    res.status(200).send(event);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getCreatedEvents(req: Request, res: Response) {
  try {
    const events = await eventService.getCreatedEvents(req.user._id);
    res.status(200).send(events);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getUserEvents(req: Request, res: Response) {
  try {
    const events = await eventService.getUserEvents(req.user._id);
    res.status(200).send(events);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getRecommendedEvents(req: Request, res: Response) {
  try {
    const events = await eventService.getEventsByUserPreferences(req.user._id);
    res.status(200).send(events);
  } catch (error) {
    res.status(400).send(error);
  }
}

export async function getEventsByQuery(req: Request, res: Response) {
  try {
    const events = await eventService.getEventsByQuery(req.query);
    res.status(200).send(events);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getEventsByCategory(req: Request, res: Response) {
  try {
    const { name }: CategoryOptions = req.query;
    const events = await eventService.getEventsByCategory({ name });
    res.status(200).send(events);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getEventsByUsername(req: Request, res: Response) {
  try {
    const { username }: UserOptions = req.query;
    const user = await userService.getUser({ username });
    const events = await eventService.getEventsByUser(user);
    res.status(200).send(events);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getEvent(req: Request, res: Response) {
  try {
    const event = await eventService.findEventById(req.params.id);
    res.status(200).send(event);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function deleteEvent(req: Request, res: Response) {
  try {
    await eventService.enforceOwnership(req.params.id, req.user._id);
    await eventService.removeEvent(req.params.id, req.user);
    res.status(201).send("Event deleted successfully");
  } catch (err) {
    return handleError(res, err);
  }
}

export async function checkUpdate(req: Request, res: Response) {
  try {
    const result = await eventService.checkEdit(req.params.id, req.user._id);
    res.status(200).send(result);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function updateEventData(req: Request, res: Response) {
  try {
    await eventService.enforceOwnership(req.params.id, req.user._id);
    await eventService.updateEventData(req.params.id, req.body);
    return res.status(201).send("Event updated successfully");
  } catch (err) {
    return handleError(res, err);
  }
}

export async function rateEvent(req: Request, res: Response) {
  try {
    await eventService.rateEvent(req.user, req.params.id, +req.body.rating);
    return res.status(200).send({ message: "Se calificó el evento" });
  } catch (err) {
    return handleError(res, err);
  }
}
