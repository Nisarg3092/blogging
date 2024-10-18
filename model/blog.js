const { model, Schema } = require("mongoose");

const blogSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    body:{
        type: String,
        required: true
    },
    coverImage:{
        type: String,
        default: "images/download.jpeg"
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    draft:{
        type: Boolean,
        default: false
    },
    flag:{
        type: Boolean,
        default: true
    }
},{timestamps: true});

const Blog = model("blog",blogSchema);

module.exports = Blog;