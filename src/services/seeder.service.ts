import data from "../seeder/data.json";
import * as categoryRepository from "../repositories/category.repository";
import * as eventRepository from "../repositories/event.repository";
import * as userRepository from "../repositories/user.repository";
import * as commentRepository from "../repositories/comment.repository";
import * as ratingRepository from "../repositories/rating.repository";

export async function generateData() {
  for (let i = 0; i < data.categories.length; i++) {
    await categoryRepository.createOne({ name: data.categories[i] });
  }

  for (let i = 0; i < data.users.length; i++) {
    const userData = data.users[i] as (typeof data.users)[0] & {
      preferences?: string[];
    };
    const newUser = await userRepository.createOne({
      username: userData.username,
      password: userData.password,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      birthdate: new Date(userData.birthdate),
      address: userData.address,
    });
    console.log(`User ${newUser.username} created`);

    if (userData.preferences?.length) {
      const categories = await Promise.all(
        userData.preferences.map((name) => categoryRepository.findOne(name)),
      );
      const categoryIds = categories
        .filter((c) => c !== null)
        .map((c) => c!._id.toString());
      await userRepository.addPreferences(newUser._id, categoryIds);
      console.log(`Preferences set for ${newUser.username}`);
    }
  }

  for (let i = 0; i < data.events.length; i++) {
    const category = await categoryRepository.findOne(data.events[i].category);
    if (!category) throw new Error("Category not found");

    const createdBy = await userRepository.findOne({
      username: data.events[i].createdBy,
    });
    if (!createdBy) throw new Error("User not found");

    const event = await eventRepository.createOne({
      title: data.events[i].title,
      description: data.events[i].description,
      location: data.events[i].location,
      start_date: new Date(data.events[i].start_date),
      end_date: new Date(data.events[i].end_date),
      img: data.events[i].img,
      category,
      private: false,
      createdBy,
    });
    await userRepository.addCreatedEvent(createdBy._id, event._id);
    console.log(`Event ${event.title} created`);
  }

  for (let i = 0; i < data.roles.length; i++) {
    const user = await userRepository.findOne({ username: data.roles[i].user });
    if (!user) throw new Error("User not found");
    const event = await eventRepository.findOne({ title: data.roles[i].event });
    if (!event) throw new Error("Event not found");
    await eventRepository.addUser(user._id, event._id);
    await userRepository.addEvent(user._id, event._id);
  }

  for (let i = 0; i < data.comments.length; i++) {
    const user = await userRepository.findOne({
      username: data.comments[i].user,
    });
    if (!user) throw new Error("User not found");
    const event = await eventRepository.findOne({
      title: data.comments[i].event,
    });
    if (!event) throw new Error("Event not found");
    const comment = await commentRepository.createOne({
      user,
      event,
      text: data.comments[i].text,
    });
    await eventRepository.updateOneById(event._id, {
      comments: [...event.comments, comment],
    });
  }

  for (let i = 0; i < data.ratings.length; i++) {
    const ratedBy = await userRepository.findOne({
      username: data.ratings[i].ratedBy,
    });
    if (!ratedBy) throw new Error("User not found");
    const event = await eventRepository.findOne({
      title: data.ratings[i].event,
    });
    if (!event) throw new Error("Event not found");
    const rating = await ratingRepository.createOne({
      ratedBy,
      event,
      ratedUser: event.createdBy,
      rating: data.ratings[i].rating,
    });
    if (rating._id) await eventRepository.addRating(event._id, rating._id);
  }

  console.log("Fake data created");
}
