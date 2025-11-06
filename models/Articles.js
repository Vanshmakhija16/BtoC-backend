import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  content: { type: String, required: true }, // Full text of article
  category: { type: String, required: true },
  date: { type: String, required: true },
  
},
  { collection: "Article" } // 👈 EXACT same as your collection name in MongoDB
);

export default mongoose.model("Article", articleSchema);
