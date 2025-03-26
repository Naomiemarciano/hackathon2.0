// models/Book.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  text: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const bookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  summary: String,
  genre: String,
  coverImage: { type: String, default: '' }, // URL de l'image du livre
  rating: { type: Number, default: 0 },       // Note moyenne
  ratingCount: { type: Number, default: 0 },    // Nombre de votes
  content: String, // Pour l'option "écrire un livre"
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Book', bookSchema);
