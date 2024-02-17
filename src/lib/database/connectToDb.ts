import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL!;

interface MongooseConection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

let cached: MongooseConection = (global as any).mongoose;
if (!cached) {
    cached = (global as any).mongoose = {
        conn: null,
        promise: null,
    };
}

const connectToMongoDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!MONGODB_URL) {
        throw new Error("Please define MONGODB_URL");
    }

    cached.promise =
        cached.promise || 
        mongoose.connect(MONGODB_URL, {
            dbName: "imaginify",
            bufferCommands: false,
        });
    cached.conn = await cached.promise;

    return cached.conn;
};

export default connectToMongoDB();
