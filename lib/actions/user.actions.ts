"use server";

import { CreateUserParams, UpdateUserParams } from "@/types";
import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import User from "../database/models/user.model";
import Event from "../database/models/event.model";
import Order from "../database/models/order.model";
import { revalidatePath } from "next/cache";

export const createUser = async (userData: CreateUserParams) => {
  try {
    await connectToDatabase();

    const newUser = await User.create(userData);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError("Error creating user");
  }
};

export const updateUser = async (
  id: string,
  updatedUserData: UpdateUserParams
) => {
  try {
    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(id, updatedUserData);

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError("Error updating user");
  }
};

export const deleteUser = async (id: string) => {
  try {
    await connectToDatabase();

    const userToDelete = await User.findOne({ id });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    await Promise.all([
      // Delete any associated events
      Event.updateMany(
        {
          _id: {
            $in: userToDelete.events,
          },
        },
        {
          $pull: {
            organizer: userToDelete._id,
          },
        }
      ),
      // Update the orders
      Order.updateMany(
        {
          _id: {
            $in: userToDelete.orders,
          },
        },
        {
          $unset: {
            buyer: 1,
          },
        }
      ),
    ]);

    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError("Error deleting user");
  }
};
