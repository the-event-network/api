import { IRating } from "../interfaces/entities";
import { RatingOptions } from "../interfaces/options";
import Paginated from "../interfaces/Paginated";
import { Rating } from "../models";
import { Types } from "mongoose";

export async function findOne(query: RatingOptions): Promise<IRating | null> {
  return await Rating.findOne(query);
}

export async function getAverageByOrganizer(
  organizerId: string,
): Promise<number | null> {
  const result: { avgRating: number }[] = await Rating.aggregate([
    {
      $lookup: {
        from: "events",
        localField: "event",
        foreignField: "_id",
        as: "eventDoc",
      },
    },
    { $unwind: "$eventDoc" },
    { $match: { "eventDoc.createdBy": new Types.ObjectId(organizerId) } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);
  return result[0]?.avgRating ?? null;
}

export async function findAll(
  query = {},
  pagination = { skip: 0, limit: 20 },
): Promise<Paginated<IRating>> {
  const { skip, limit } = pagination;
  const [data, total] = await Promise.all([
    Rating.find(query).skip(skip).limit(limit),
    Rating.countDocuments(query),
  ]);
  return { data, total };
}

export async function createOne(category: Partial<IRating>): Promise<IRating> {
  const newRating = new Rating(category);
  await newRating.save();
  return newRating;
}

export async function upsertOne(
  query: RatingOptions,
  data: Partial<IRating>,
): Promise<IRating> {
  const { rating, ...onInsertFields } = data;
  return await Rating.findOneAndUpdate(
    query,
    { $set: { rating }, $setOnInsert: onInsertFields },
    { new: true, upsert: true },
  );
}

export async function removeOneById(id: string): Promise<void> {
  await Rating.findByIdAndRemove(id);
}
