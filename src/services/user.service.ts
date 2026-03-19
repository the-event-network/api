import { generateToken, validateToken } from "../config/tokens";
import UserDto from "../interfaces/dto/user.dto";
import { IUser } from "../interfaces/entities";
import HttpError from "../interfaces/HttpError";
import { InvitationOptions, UserOptions } from "../interfaces/options";
import * as userMapper from "../mappers/user.mapper";
import * as userRepository from "../repositories/user.repository";
import * as emailRepository from "../repositories/email.repository";
import * as whatsappRepository from "../repositories/whatsapp.repository";

export async function inviteUsers(data: InvitationOptions, userId: string) {
  const usernames = data.users;
  const eventTitle = data.plan.title;
  const user = await userRepository.findOneById(userId);
  if (!user) return;

  const { data: invitedUsers } = await userRepository.findAll({ usernames });
  invitedUsers.forEach(async (invitedUser) => {
    switch (data.method) {
      case "email":
        await emailRepository.send({
          email: invitedUser.email,
          username: user.username,
          eventId: data.plan._id,
          eventTitle,
        });
        break;
      case "phone":
        if (!invitedUser.phone) return;
        await whatsappRepository.send({
          username: invitedUser.username,
          eventTitle,
          eventId: data.plan._id,
          to: invitedUser.phone,
        });
        break;
    }
  });
}

export async function login(username: string, password: string) {
  const userPayload = await userRepository.getPayload({ username });
  if (!userPayload) throw new HttpError(401, "Invalid username or password");

  const isValid = await userPayload.validatePassword(password);
  if (!isValid) throw new HttpError(401, "Invalid username or password");

  const token = generateToken(userPayload);
  return { token, userPayload };
}

export async function addPreferences(userId: string, categoryIds: string[]) {
  const user = await userRepository.findOneById(userId);
  if (!user) throw new HttpError(404, "User not found");
  await userRepository.addPreferences(userId, categoryIds);
  await userRepository.updateOneById(user._id, { new_user: false });
}

export async function getUser(userQuery: UserOptions): Promise<IUser> {
  const user = await userRepository.findOne(userQuery);
  if (!user) throw new HttpError(404, "User not found");
  return user;
}

export async function addUser(userData: UserDto) {
  const user = userMapper.fromDtoToEntity(userData);
  await userRepository.createOne(user);
}

export async function getUsers() {
  return await userRepository.findAll();
}

export async function getUserById(userId: string) {
  const user = await userRepository.findOneById(userId);
  if (!user) throw new HttpError(404, "User not found");
  return user;
}

export async function updateUser(userId: string, userData: Partial<IUser>) {
  return await userRepository.updateOneById(userId, userData);
}

export async function addFriend(userId: string, friendId: string) {
  const user = await userRepository.findOneById(userId);
  if (!user) return;

  const friend = await userRepository.findOneById(friendId);
  if (!friend) return;

  const friends = user.friends;
  const updatedUserFriends = userMapper.addUser(friends, friend);
  const updatedFriendFriends = userMapper.addUser(friends, friend);

  await userRepository.updateOneById(user._id, { friends: updatedUserFriends });
  await userRepository.updateOneById(friend._id, {
    friends: updatedFriendFriends,
  });
}

export async function removeUserFriend(userId: string, friendId: string) {
  const user = await userRepository.findOneById(userId);
  if (!user) return;

  const friend = await userRepository.findOneById(friendId);
  if (!friend) return;

  const userFriends = await getUserFriends(userId);
  if (!userFriends) return;

  const friendFriends = await getUserFriends(friendId);
  if (!friendFriends) return;

  const friends = user.friends;
  const updatedUserFriends = userMapper.removeUser(friends, friend);
  const updatedFriendFriends = userMapper.removeUser(friends, friend);

  await userRepository.updateOneById(user._id, { friends: updatedUserFriends });
  await userRepository.updateOneById(friend._id, {
    friends: updatedFriendFriends,
  });
}

export async function getUserFriends(userId: string) {
  const paginatedUsers = await userRepository.findAllFriends(userId);
  if (!paginatedUsers) throw new HttpError(404, "User not found");

  return {
    data: paginatedUsers.data.map(({ friends }: IUser) => friends),
    total: paginatedUsers.total,
  };
}

export async function getUserPayload(token?: string) {
  const result = validateToken(token);
  if (typeof result === "string") throw new HttpError(401, "Unauthorized");
  return result.payload;
}
