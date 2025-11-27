// src/models/dashboardNote.model.js
import mongoose from "mongoose";

const DashboardNoteSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true } // có createdAt, updatedAt
);

export const DashboardNote = mongoose.model(
  "DashboardNote",
  DashboardNoteSchema
);
