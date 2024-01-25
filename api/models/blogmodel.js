const mongoose = require('mongoose');
const MongooseFTS = require("mongoose-fts"); 

const Schema = mongoose.Schema;

const blogPostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  authorid:{
    type:String,
    required:true,
  }

});

// blogPostSchema.createIndex({title : "text"})

blogPostSchema.index({title: 'text'}); 
module.exports = mongoose.model('BlogPost', blogPostSchema);


//   pdf: {
//     type: String, // Can be a URL or file path depending on implementation
//     // Can use a separate storage solution like GridFS for large files
//   },
//   isPdfLink: {
//     type: Boolean,
//     default: false,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },