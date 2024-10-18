const { model, Schema } = require("mongoose");

const commentLikeSchema = new Schema({
    commentId:{
        type: Schema.Types.ObjectId,
        ref: "comment",
        required: true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
},{timestamps: true});

const CommentLikes = model("commentLike",commentLikeSchema);

module.exports = CommentLikes;