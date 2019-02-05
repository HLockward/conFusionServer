const mongoose = require('mongoose');
const schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new schema({
    firstname : {
        type: String,
        default: ''
    },
    lastname : {
        type: String,
        default: ''
    },
    facebookId : String,
    admin : {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

userSchema.plugin(passportLocalMongoose);

const Users = mongoose.model('user', userSchema);

module.exports = Users;