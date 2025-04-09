import mongoose, { InferSchemaType } from "mongoose";

type IWordsMaker = InferSchemaType<typeof WordSMaker>;


const WordSMaker = new mongoose.Schema({
    level: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    hints: {
        type: [String],
        required: true,
    },
    words: {
        type: [String],
    },
    letters: {
        type: [[String]],
        required: true,
    },
    gridSize: {
        type: Number,
        required: true,
    },
    totalPoints: {
        type: Number,
        required: true,
    },
    timeLimit: {
        type: Number,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
})


export default mongoose.model<IWordsMaker>('WordsMaker', WordSMaker);