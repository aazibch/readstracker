const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user.']
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        maxlength: [
            150,
            'Message content should have fewer than one hundred and fifty one characters.'
        ],
        required: true
    }
});

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        minlength: [2, 'The title should at least have two characters.'],
        maxlength: [
            100,
            'The title should have fewer than one hundred and one characters.'
        ],
        required: [true, 'Please provide a title.']
    },
    author: {
        type: String,
        minlength: [
            3,
            "The author's name should at least have three characters."
        ],
        maxlength: [
            100,
            "The author's name should have fewer than one hundred and one characters."
        ],
        required: [true, 'Please provide an author.']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please provide a rating.']
    },
    genre: {
        type: String,
        minlength: 4,
        maxlength: 40,
        required: [true, 'Please provide a genre.'],
        enum: {
            values: [
                'Action and Adventure',
                'Biography or Autobiography',
                'Coming-of-age',
                'Crime',
                'Drama',
                'Dystopian Fiction',
                'Fantasy',
                'History',
                'Mystery',
                'Pop-sci',
                'Poetry',
                'Romance',
                'Self help',
                'Sci-fi',
                'Satire',
                'Spirituality',
                'Thriller',
                'Philosophical Fiction'
            ],
            message: 'Please provide a valid genre.'
        }
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user.']
    },
    review: {
        type: String,
        maxlength: 280
    },
    likedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: []
        }
    ],
    comments: {
        type: [commentSchema]
    }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
