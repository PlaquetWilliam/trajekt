import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { CONTINENT_VALUES, STYLE_VALUES } from "@/lib/catalog";

const itineraryStepSchema = new Schema(
  {
    days: { type: String, required: true, trim: true }, // ex. « Jours 2–3 »
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false },
);

const destinationSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    continent: { type: String, required: true, enum: CONTINENT_VALUES },
    styles: { type: [{ type: String, enum: STYLE_VALUES }], default: [] },
    durationDays: { type: Number, min: 1 },
    bestPeriod: { type: String, trim: true },
    budgetFrom: { type: Number, min: 0 },
    summary: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, trim: true },
    image: {
      src: { type: String },
      alt: { type: String },
    },
    gallery: { type: [{ src: String, alt: String, _id: false }], default: [] },
    itinerary: { type: [itineraryStepSchema], default: [] },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

destinationSchema.index({ published: 1, featured: -1, name: 1 });
destinationSchema.index({ published: 1, continent: 1 });
destinationSchema.index({ published: 1, styles: 1 });

export type DestinationDoc = InferSchemaType<typeof destinationSchema>;

export const Destination: Model<DestinationDoc> =
  models.Destination ?? model<DestinationDoc>("Destination", destinationSchema);
