import { Document, Schema, model, models } from "mongoose";

export interface IOrder extends Document {
  stripeId: string;
  event: {
    _id: string;
    title: string;
  };
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  totalAmount: string;
  createdAt: Date;
}

export type IOrderItem = {
  _id: string;
  totalAmount: string;
  createdAt: Date;
  eventTitles: string;
  eventId: string;
  buyer: string;
};

const OrderSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: "Event" },
  buyer: { type: Schema.Types.ObjectId, ref: "User" },
  stripeId: { type: String, required: true, unique: true },
  totalAmount: { type: String },
  createdAt: { type: Date, default: Date.now },
});
const Order = models.Order || model("Order", OrderSchema);
export default Order;
