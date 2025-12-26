const mongoose = require("mongoose");

const ShareSettingsSchema = new mongoose.Schema(
  {
    isPublic: { type: Boolean, default: false },
    permissions: { type: String, enum: ["view", "edit"], default: "view" },
    expiresAt: { type: Date, default: null },
    password: { type: String, default: null },
    requireSignIn: { type: Boolean, default: false },
  },
  { _id: false }
);

const FileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["file", "folder"], required: true },
  mimeType: { type: String, default: null },
  size: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
  owner: { type: String, required: true },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
    default: null,
  },
  isShared: { type: Boolean, default: false },
  shareSettings: { type: ShareSettingsSchema, default: () => ({}) },
  thumbnail: { type: String, default: null },
  tags: { type: [String], default: [] },
  azureBlobUrl: { type: String, default: null },
});

module.exports = mongoose.model("File", FileSchema);
