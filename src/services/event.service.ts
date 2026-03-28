import { EventOptions, CategoryOptions } from "../interfaces/options";
import HttpError from "../interfaces/HttpError";
import { IUser } from "../interfaces/entities";
import { EventDto } from "../interfaces/dto";
import * as eventMapper from "../mappers/event.mapper";
import * as categoryMapper from "../mappers/category.mapper";
import * as categoryRepository from "../repositories/category.repository";
import * as eventRepository from "../repositories/event.repository";
import * as ratingRepository from "../repositories/rating.repository";
import * as userRepository from "../repositories/user.repository";
import { getOrSet, del, delPattern } from "../cache";

const EVENT_DETAIL_TTL = 300;
const EVENT_LIST_TTL = 120;

function eventDetailKey(id: string) {
  return `events:detail:${id}`;
}

function eventListKey(options: object) {
  return `events:list:${JSON.stringify(options)}`;
}

export async function enroll(eventId: string, userId: string) {
  const event = await eventRepository.addUser(eventId, userId);
  if (!event) throw new HttpError(404, "Event not found");

  const user = await userRepository.addEvent(userId, eventId);
  if (!user) throw new HttpError(404, "User not found");

  await del(eventDetailKey(eventId));
  return event;
}

export async function rateEvent(
  ratedBy: IUser,
  eventId: string,
  rating: number,
) {
  const event = await eventRepository.findOneById(eventId);
  if (!event) throw new HttpError(404, "Event not found");

  const savedRating = await ratingRepository.upsertOne(
    { ratedBy: ratedBy._id, event: eventId },
    { rating, ratedUser: event.createdBy, event },
  );
  if (savedRating._id)
    await eventRepository.addRating(eventId, savedRating._id);

  await del(eventDetailKey(eventId));
}

export async function getUserRatingForEvent(userId: string, eventId: string) {
  const rating = await ratingRepository.findOne({
    ratedBy: userId,
    event: eventId,
  });
  return rating?.rating ?? null;
}

export async function stopParticipating(user: IUser, eventId: string) {
  const event = await eventRepository.findOneById(eventId);
  if (!event) throw new HttpError(404, "Event not found");

  await eventRepository.removeUser(eventId, user._id);
  await userRepository.removeEvent(user._id, eventId);
  await del(eventDetailKey(eventId));
}

export async function createNewEvent(eventData: EventDto, user: IUser) {
  const category = await categoryRepository.findOne(eventData.category);
  if (!category) throw new HttpError(404, "Category not found");
  const event = eventMapper.fromDtoToEntity(eventData);
  event.category = category;
  event.createdBy = user;
  const newEvent = await eventRepository.createOne(event);
  await userRepository.addCreatedEvent(user._id, newEvent._id);
  await delPattern("events:list:*");
  return newEvent;
}

export async function findEventById(eventId: string) {
  return getOrSet(eventDetailKey(eventId), EVENT_DETAIL_TTL, () =>
    eventRepository.findOneById(eventId),
  );
}

export async function getEvents(options: EventOptions) {
  return getOrSet(eventListKey(options), EVENT_LIST_TTL, () =>
    eventRepository.findAll(options),
  );
}

export async function getEventsByUserPreferences(userId: string) {
  const user = await userRepository.findOneById(userId);
  if (!user) throw new HttpError(404, "User not found");

  const preferences = categoryMapper.fromEntitiesToArray(user.preferences);
  return getOrSet(
    eventListKey({ preferences }),
    EVENT_LIST_TTL,
    () => eventRepository.findAll({ preferences }),
  );
}

export async function getEventsByCategory(query: CategoryOptions) {
  if (!query.name) throw new HttpError(400, "No category name specified");

  const category = await categoryRepository.findOne(query.name);
  if (!category) throw new HttpError(404, "Event not found");

  return getOrSet(
    eventListKey({ categoryId: category._id }),
    EVENT_LIST_TTL,
    () => eventRepository.findAll({ categoryId: category._id }),
  );
}

export async function getEventsByUser(user: IUser) {
  return user.events;
}

export async function getEventsByQuery(query: EventOptions) {
  const { searchTerm } = query;
  return getOrSet(eventListKey({ searchTerm }), EVENT_LIST_TTL, () =>
    eventRepository.findAll({ searchTerm }),
  );
}

export async function getUserEvents(userId: string) {
  const paginatedUsers = await userRepository.findEvents(userId, {
    maxDate: new Date(),
  });
  return {
    data: paginatedUsers.data.map(({ events }: IUser) => events),
    total: paginatedUsers.total,
  };
}

export async function getCreatedEvents(userId: string) {
  return getOrSet(
    eventListKey({ createdBy: userId }),
    EVENT_LIST_TTL,
    () => eventRepository.findAll({ createdBy: userId }),
  );
}

export async function removeEvent(eventId: string, user: IUser) {
  const event = await eventRepository.findOneById(eventId);
  if (!event) throw new HttpError(404, "Event not found");

  await eventRepository.removeOneById(eventId);

  await eventRepository.removeUser(user._id, eventId);
  await userRepository.removeEvent(eventId, user._id);

  await eventRepository.updateOneById(event._id, {
    users: event.users.filter(({ _id }) => _id !== user._id),
  });
  await userRepository.updateOneById(user._id, {
    events: user.events.filter(({ _id }) => _id !== eventId),
  });

  await del(eventDetailKey(eventId));
  await delPattern("events:list:*");
}

export async function updateEventData(eventId: string, updatedData: EventDto) {
  const event = eventMapper.fromDtoToEntity(updatedData);
  if (updatedData.category) {
    const category = await categoryRepository.findOne(updatedData.category);
    if (!category) throw new HttpError(404, "Category not found");
    event.category = category;
  }
  await eventRepository.updateOneById(eventId, event);
  await del(eventDetailKey(eventId));
  await delPattern("events:list:*");
}

export async function checkEdit(eventId: string, userId: string) {
  const event = await eventRepository.findOneById(eventId);
  if (!event) throw new HttpError(404, "Event not found");
  return event.createdBy._id === userId;
}

export async function getOrganizerAvgRating(eventId: string) {
  const event = await eventRepository.findOneById(eventId);
  if (!event) throw new HttpError(404, "Event not found");
  return await ratingRepository.getAverageByOrganizer(event.createdBy._id);
}
