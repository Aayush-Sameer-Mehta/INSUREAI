import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log("✅ MongoDB connected →", uri);
  } catch (err) {
    console.warn("⚠️  Could not connect to MongoDB at:", uri);
    console.warn("   Reason:", err.message);
    console.log("🔄 Starting in-memory MongoDB (data will not persist across restarts)...");

    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();

      await mongoose.connect(memUri);
      console.log("✅ In-memory MongoDB connected →", memUri);
      console.log("💡 Tip: Install MongoDB locally or use MongoDB Atlas for persistent data.");
    } catch (memErr) {
      console.error("❌ Failed to start in-memory MongoDB:", memErr.message);
      process.exit(1);
    }
  }
}
