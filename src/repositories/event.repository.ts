import { Types } from "mongoose";
import { IEvent } from "../interfaces/entities";
import { EventOptions } from "../interfaces/options";
import Paginated from "../interfaces/Paginated";
import { Event } from "../models";

type Search = { $regex: string; $options: string };

type WhereClause = {
  start_date?: { $gte?: Date; $lte?: Date };
  category?: { $in: string[] } | { name: Search } | string;
  createdBy?: string;
  user?: { username: Search };
  $or?: [{ title: Search }, { description: Search }];
};

export async function findOne(query: EventOptions = {}) {
  return await Event.findOne({
    private: false,
    ...query,
  }).populate({
    path: "category",
    model: "Category",
  });
}

export async function removeUser(
  eventId: string,
  userId: string,
): Promise<IEvent | null> {
  return await Event.findOneAndUpdate(
    { _id: new Types.ObjectId(eventId) },
    { $pull: { users: new Types.ObjectId(userId) } },
    { new: true },
  );
}

export async function addUser(
  eventId: string,
  userId: string,
): Promise<IEvent | null> {
  return await Event.findOneAndUpdate(
    { _id: new Types.ObjectId(eventId) },
    { $addToSet: { users: new Types.ObjectId(userId) } },
    { new: true },
  );
}

async function findByUsername(
  searchTerm: string,
  pagination = { skip: 0, limit: 20 },
) {
  const { skip, limit } = pagination;
  const result = await Event.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdByUser",
      },
    },
    {
      $match: {
        "createdByUser.username": { $regex: searchTerm, $options: "i" },
      },
    },
    {
      $facet: {
        paginatedResults: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "totalCount" }],
      },
    },
  ]);
  const data = result[0]?.paginatedResults ?? [];
  const total = result[0]?.totalCount[0]?.totalCount ?? 0;
  return { data, total };
}

async function findByCategory(
  searchTerm: string,
  pagination = { skip: 0, limit: 20 },
) {
  const { skip, limit } = pagination;
  const result = await Event.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    {
      $match: {
        "categoryDetails.name": { $regex: searchTerm, $options: "i" },
      },
    },
    {
      $facet: {
        paginatedResults: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "totalCount" }],
      },
    },
  ]);
  const data = result[0]?.paginatedResults ?? [];
  const total = result[0]?.totalCount[0]?.totalCount ?? 0;
  return { data, total };
}

export async function findAll(
  query: EventOptions = {},
  pagination = { skip: 0, limit: 20 },
): Promise<Paginated<IEvent>> {
  const where: WhereClause = {};
  const {
    minDate,
    maxDate,
    preferences,
    categoryId,
    search,
    searchTerm = "",
    createdBy,
  } = query;

  if (minDate) where.start_date = { $gte: new Date() };
  if (maxDate) where.start_date = { $lte: new Date() };
  if (preferences) where.category = { $in: preferences };
  if (categoryId) where.category = categoryId;
  if (createdBy) where.createdBy = createdBy;

  switch (search) {
    case "text":
      where["$or"] = [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ];
      break;
    case "user":
      return await findByUsername(searchTerm, pagination);
    case "category":
      return await findByCategory(searchTerm, pagination);
  }

  const { skip, limit } = pagination;
  const [data, total] = await Promise.all([
    Event.find({ private: false, ...where })
      .populate({ path: "category", model: "Category" })
      .skip(skip)
      .limit(limit),
    Event.countDocuments(query),
  ]);

  return { data, total };
}

export async function findOneById(id: string): Promise<IEvent | null> {
  return await Event.findById(id).populate([
    { path: "createdBy", model: "User" },
    {
      path: "comments",
      model: "Comment",
      populate: { path: "user", model: "User", select: "_id, username" },
    },
    { path: "category", model: "Category" },
    { path: "ratings", model: "Rating" },
  ]);
}

export async function addRating(
  eventId: string,
  ratingId: string,
): Promise<void> {
  await Event.findByIdAndUpdate(eventId, {
    $addToSet: { ratings: new Types.ObjectId(ratingId) },
  });
}

export async function createOne(eventData: Partial<IEvent>): Promise<IEvent> {
  const event = new Event(eventData);
  await event.populate({
    path: "category",
    select: "name",
    model: "Category",
  });
  await event.validate();
  await event.save();
  return event;
}

export async function updateOneById(
  id: string,
  eventData: Partial<IEvent>,
): Promise<void> {
  await Event.findByIdAndUpdate(id, eventData);
}

export async function removeOneById(id: string): Promise<void> {
  await Event.findByIdAndRemove(id);
}
