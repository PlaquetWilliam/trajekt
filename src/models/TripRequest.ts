import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** Demande de voyage issue du formulaire « Créer mon voyage » (5 étapes). */
const tripRequestSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    status: {
      type: String,
      enum: ["draft", "sent", "preparing", "proposed", "archived"],
      default: "draft",
      index: true,
    },
    currentStep: { type: Number, min: 1, max: 5, default: 1 },

    // Étape 1 — Destination
    destination: { type: String, trim: true },
    destinationRef: { type: Schema.Types.ObjectId, ref: "Destination" },

    // Étape 2 — Dates
    dates: {
      start: Date,
      end: Date,
      flexible: { type: Boolean, default: false },
    },

    // Étape 3 — Voyageurs & budget
    travellers: {
      adults: { type: Number, min: 1, default: 2 },
      children: { type: Number, min: 0, default: 0 },
    },
    budgetPerPerson: { type: Number, min: 0 },

    // Étape 4 — Style & envies
    styles: { type: [String], default: [] },
    pace: { type: String, enum: ["tranquille", "equilibre", "intense"] },
    wishes: { type: String, trim: true, maxlength: 2000 },

    // Étape 5 — Coordonnées
    contact: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
    },
  },
  { timestamps: true },
);

export type TripRequestDoc = InferSchemaType<typeof tripRequestSchema>;

export const TripRequest: Model<TripRequestDoc> =
  models.TripRequest ?? model<TripRequestDoc>("TripRequest", tripRequestSchema);
