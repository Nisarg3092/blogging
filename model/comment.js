const { model, Schema } = require("mongoose");

const commentSchema = new Schema({
    comment:{
        type: String,
        required: true
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    blogId:{
        type: Schema.Types.ObjectId,
        ref: "blog",
        required: true
    },
    flag:{
        type: Boolean,
        default: true,
        required: true
    }
},{timestamps: true});

const Comment = model("comment",commentSchema);

module.exports = Comment;