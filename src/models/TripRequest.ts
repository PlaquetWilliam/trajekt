import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { STYLE_VALUES } from "@/lib/catalog";
import { BUDGET_VALUES, PACE_VALUES } from "@/lib/trip";

/** Demande de voyage issue du formulaire « Créer mon voyage » (5 étapes). */
const tripRequestSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    status: {
      type: String,
      enum: ["draft", "sent", "preparing", "proposed", "archived"],
      default: "sent",
      index: true,
    },

    // Étape 1 — Destination
    destination: { type: String, trim: true, maxlength: 120 },
    destinationRef: { type: Schema.Types.ObjectId, ref: "Destination" },
    undecided: { type: Boolean, default: false },

    // Étape 2 — Dates
    dates: {
      mode: { type: String, enum: ["precises", "flexibles"], required: true },
      start: Date,
      end: Date,
      month: String, // AAAA-MM
      durationDays: Number,
    },

    // Étape 3 — Voyageurs & budget
    travellers: {
      adults: { type: Number, min: 1, max: 20, required: true },
      children: { type: Number, min: 0, max: 20, default: 0 },
    },
    budget: { type: String, enum: BUDGET_VALUES, required: true },

    // Étape 4 — Style & envies
    styles: { type: [{ type: String, enum: STYLE_VALUES }], default: [] },
    pace: { type: String, enum: PACE_VALUES, required: true },
    wishes: { type: String, trim: true, maxlength: 2000 },

    // Étape 5 — Coordonnées
    contact: {
      firstName: { type: String, trim: true, required: true },
      lastName: { type: String, trim: true, required: true },
      email: { type: String, trim: true, lowercase: true, required: true, index: true },
      phone: { type: String, trim: true },
    },
    consentAt: { type: Date, required: true },

    // Suivi (espace admin)
    clientMessage: { type: String, trim: true, maxlength: 1000 }, // visible par le client
    internalNote: { type: String, trim: true, maxlength: 2000 }, // visible uniquement par l'équipe
    statusHistory: {
      type: [
        {
          status: { type: String, required: true },
          at: { type: Date, required: true },
          by: { type: String }, // nom de l'administrateur
          _id: false,
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

tripRequestSchema.index({ status: 1, createdAt: -1 });

export type TripRequestDoc = InferSchemaType<typeof tripRequestSchema>;

export const TripRequest: Model<TripRequestDoc> =
  models.TripRequest ?? model<TripRequestDoc>("TripRequest", tripRequestSchema);
