const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Middleware to require login
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// GET /books - Display all books with optional search (sorted alphabetically by title)
router.get('/books', async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    let books;
    if (searchQuery !== '') {
      books = await Book.find({
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { author: { $regex: searchQuery, $options: 'i' } }
        ]
      })
        .populate('createdBy')
        .sort({ title: 1 });
    } else {
      books = await Book.find()
        .populate('createdBy')
        .sort({ title: 1 });
    }
    res.render('books/allBooks', { books, searchQuery });
  } catch (error) {
    console.error(error);
    res.send('Error retrieving books');
  }
});

// GET /books/new - Form to add a new book
router.get('/books/new', requireLogin, (req, res) => {
  res.render('books/newBook');
});

// POST /books - Create a new book
router.post('/books', requireLogin, async (req, res) => {
  try {
    const { title, author, summary, genre } = req.body;
    const newBook = new Book({
      title,
      author,
      summary,
      genre,
      createdBy: req.session.userId
    });
    await newBook.save();
    res.redirect('/books');
  } catch (error) {
    console.error(error);
    res.send('Error creating the book');
  }
});

// GET /books/:id - Display a specific book and its comments
router.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('createdBy')
      .populate('comments.author');
    if (!book) {
      return res.send('Book not found');
    }
    // Pass session to the view so it's accessible in EJS templates
    res.render('books/bookDetails', { book, session: req.session });
  } catch (error) {
    console.error(error);
    res.send('Error retrieving the book');
  }
});

// POST /books/:id/comments - Add a comment to a book
router.post('/books/:id/comments', requireLogin, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.send('Book not found');
    }
    book.comments.push({
      text: req.body.commentText,
      author: req.session.userId
    });
    await book.save();
    res.redirect(`/books/${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.send('Error adding the comment');
  }
});

// POST /books/:id/delete - Delete a book
router.post('/books/:id/delete', requireLogin, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.send('Book not found');
    }
    if (book.createdBy.toString() !== req.session.userId) {
      return res.send("You are not authorized to delete this book");
    }
    await Book.findByIdAndDelete(req.params.id);
    res.redirect('/books');
  } catch (error) {
    console.error(error);
    res.send('Error deleting the book');
  }
});

// GET /books/:id/edit - Display form to edit the book summary
router.get('/books/:id/edit', requireLogin, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.send('Book not found');
    if (book.createdBy.toString() !== req.session.userId) {
      return res.send("You're not authorized to edit this book");
    }
    res.render('books/editBook', { book });
  } catch (error) {
    console.error(error);
    res.send('Error retrieving the book for editing');
  }
});

// POST /books/:id/edit - Handle form submission to update the book summary
router.post('/books/:id/edit', requireLogin, async (req, res) => {
  try {
    const { summary } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.send('Book not found');
    if (book.createdBy.toString() !== req.session.userId) {
      return res.send("You're not authorized to edit this book");
    }
    book.summary = summary;
    await book.save();
    res.redirect(`/books/${book._id}`);
  } catch (error) {
    console.error(error);
    res.send('Error updating the book');
  }
});

// GET /books/write - Display form to write a new book (extended content)
router.get('/books/write', requireLogin, (req, res) => {
  res.render('books/writeBook'); // Make sure this view exists
});

// POST /books/write - Handle new book submission (writing a new book)
router.post('/books/write', requireLogin, async (req, res) => {
  try {
    const { title, author, summary, genre, content } = req.body;
    const newBook = new Book({
      title,
      author,
      summary,
      genre,
      content, // Ensure your Book schema has a field for full content
      createdBy: req.session.userId
    });
    await newBook.save();
    res.redirect('/books');
  } catch (error) {
    console.error(error);
    res.send('Error writing the book');
  }
});

// POST /books/:id/rate - Rate a book
router.post('/books/:id/rate', requireLogin, async (req, res) => {
  try {
    const rating = Number(req.body.rating);
    if (rating < 1 || rating > 5) {
      return res.send("Invalid rating");
    }
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.send('Book not found');
    }
    // Update the average rating
    const newRatingCount = book.ratingCount + 1;
    const newRatingTotal = (book.rating * book.ratingCount) + rating;
    book.rating = newRatingTotal / newRatingCount;
    book.ratingCount = newRatingCount;
    await book.save();
    res.redirect(`/books/${book._id}`);
  } catch (error) {
    console.error(error);
    res.send('Error rating the book');
  }
});

// POST /books/:id/rate - Rate a book
router.post('/books/:id/rate', requireLogin, async (req, res) => {
  console.log("POST /books/:id/rate route hit for id:", req.params.id); // Debug log
  try {
    const rating = Number(req.body.rating);
    if (rating < 1 || rating > 5) {
      return res.send("Invalid rating");
    }
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.send('Book not found');
    }
    // Update the average rating
    const newRatingCount = book.ratingCount + 1;
    const newRatingTotal = (book.rating * book.ratingCount) + rating;
    book.rating = newRatingTotal / newRatingCount;
    book.ratingCount = newRatingCount;
    await book.save();
    res.redirect(`/books/${book._id}`);
  } catch (error) {
    console.error(error);
    res.send('Error rating the book');
  }
});

module.exports = router;
