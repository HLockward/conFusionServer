const mongoose = require('mongoose');
const schema = mongoose.Schema;
/**
 * firstname: '',
    lastname: '',
    telnum: '',
    email: '',
    agree: false,
    contactType: 'Tel.',
    message: ''
 */
const FeedbackSchema = new schema({
    firstname : {
        type: String,
        required: true
    },
    lastname : {
        type: String,
        required: true
    },
    telnum : {
        type: Number,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    agree : {
        type: Boolean,
        default: false
    },
    contactType : {
        type: String,
        required: true
    },
    message : {
        type: String
    }
},{
    timestamps: true
});

const Feedbacks = mongoose.model('feedback', FeedbackSchema);

module.exports = Feedbacks;