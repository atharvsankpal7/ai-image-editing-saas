import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL!;

interface MongooseConection {
    // the connection to the database
    conn: Mongoose | null;
    // the promise used to connect to the database
    promise: Promise<Mongoose> | null;
}
// getting the connection from the global variable
let cached: MongooseConection = (global as any).mongoose;
// if there is no connection cached globally, create a new one
if (!cached) {
    cached = (global as any).mongoose = {
        conn: null,
        promise: null,
    };
}

/**
 * Connects to MongoDB database defined in MONGODB_URL environment variable.
 * Caches the database connection to avoid creating new connections.
 * Returns the cached connection or creates a new one if it doesn't exist.
 */
const connectToMongoDB = async () => {
    // if the connection is cached, return it
    if (cached.conn) {
        return cached.conn;
    }

    if (!MONGODB_URL) {
        throw new Error("Please define MONGODB_URL");
    }

    cached.promise =
        cached.promise || // if connection promise is not present call the database to create one
        mongoose.connect(MONGODB_URL, {
            dbName: "imaginify",
            bufferCommands: false,
        });

    // once the connection is created after resolving of promise, cache it and return it
    cached.conn = await cached.promise;

    return cached.conn;
};

export default connectToMongoDB();
