import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const foodItemSchema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, required: true, ref: 'Restaurant', index: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    price: { type: Number, required: true, min: 1 },
    category: { type: String, required: true, trim: true, maxlength: 50 },
    dietaryTags: { type: [String], default: [] },
    imageUrls: { type: [String], default: [] },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type FoodItemAttributes = InferSchemaType<typeof foodItemSchema>;
export type FoodItemDocument = HydratedDocument<FoodItemAttributes>;

export const FoodItemModel = model('FoodItem', foodItemSchema);
