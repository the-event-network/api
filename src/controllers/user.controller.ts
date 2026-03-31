import { Request, Response } from "express";
import handleError from "../utils/handleError";
import * as userService from "../services/user.service";

export async function inviteUsers(req: Request, res: Response) {
  try {
    await userService.inviteUsers(req.body, req.user._id);
    return res.status(200).send("Invitations sent");
  } catch (err) {
    handleError(res, err);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const { token, userPayload } = await userService.login(username, password);
    req.user = userPayload;
    return res.status(200).send({ token });
  } catch (err) {
    handleError(res, err);
  }
}

export async function signup(req: Request, res: Response) {
  try {
    await userService.addUser(req.body);
    return res.status(200).send("User created");
  } catch (err) {
    handleError(res, err);
  }
}

export async function addPreferences(req: Request, res: Response) {
  try {
    await userService.addPreferences(req.user._id, req.body);
    return res.status(200).send("Preferences added");
  } catch (err) {
    handleError(res, err);
  }
}

export async function getUsers(_: Request, res: Response) {
  try {
    const users = await userService.getUsers();
    return res.send(users);
  } catch (err) {
    handleError(res, err);
  }
}

export async function findByEmail(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const user = await userService.getUser({ email });
    return res.status(200).send(user);
  } catch (err) {
    handleError(res, err);
  }
}

export async function me(req: Request, res: Response) {
  try {
    const user = await userService.getUserById(req.user._id);
    if (!user) return;
    res.send(user);
  } catch (err) {
    handleError(res, err);
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const user = await userService.updateUser(req.user._id, req.body);
    return res.send(user);
  } catch (err) {
    handleError(res, err);
  }
}

export async function addFriend(req: Request, res: Response) {
  try {
    await userService.addFriend(req.user._id, req.body.friendId);
    res.sendStatus(204);
  } catch (err) {
    handleError(res, err);
  }
}

export async function removeUserFriend(req: Request, res: Response) {
  try {
    await userService.removeUserFriend(req.user._id, req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(400).send(error);
  }
}

export async function getUserFriends(req: Request, res: Response) {
  try {
    const userFriends = await userService.getUserFriends(req.user._id);
    res.send(userFriends).status(200);
  } catch (err) {
    handleError(res, err);
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const user = await userService.getUserById(req.params.id);
    res.send(user);
  } catch (err) {
    handleError(res, err);
  }
}
