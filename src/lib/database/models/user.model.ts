import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },

    profilePhoto: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },

    planId: {
        type: Number,
        default: 1,
    },
    creditBalance: {
        type: Number,
        default: 20,
    },
});
const User = mongoose.models?.User || mongoose.model("User", userSchema);
export default User;
