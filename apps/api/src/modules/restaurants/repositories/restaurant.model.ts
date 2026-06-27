import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const coordinatesSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false },
);

const addressSchema = new Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    coordinates: { type: coordinatesSchema },
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
  },
  { _id: false },
);

const restaurantSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    address: { type: addressSchema, required: true },
    cuisineTags: { type: [String], default: [] },
    logoUrl: { type: String, default: null },
    coverImageUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

restaurantSchema.index({ name: 'text', description: 'text' });
restaurantSchema.index({ 'address.location': '2dsphere' });

restaurantSchema.pre('save', function () {
  if (this.address?.coordinates?.lat != null && this.address?.coordinates?.lng != null) {
    this.address.location = {
      type: 'Point',
      coordinates: [this.address.coordinates.lng, this.address.coordinates.lat],
    };
  } else if (this.address) {
    this.address.location = undefined;
  }
});

restaurantSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate() as Record<string, unknown> | null;
  if (!update) return;
  const coords = (update.$set as Record<string, unknown> | undefined)?.['address.coordinates'] ??
    (update as Record<string, unknown>)['address.coordinates'] ??
    (update.$set as Record<string, { coordinates?: { lat: number; lng: number } }> | undefined)?.address?.coordinates;
  if (coords && typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
    const c = coords as { lat: number; lng: number };
    this.set('address.location', { type: 'Point', coordinates: [c.lng, c.lat] });
  }
});

export type RestaurantAttributes = InferSchemaType<typeof restaurantSchema>;
export type RestaurantDocument = HydratedDocument<RestaurantAttributes>;

export const RestaurantModel = model('Restaurant', restaurantSchema);
