const mongoose = require('mongoose');
const schema = mongoose.Schema;

const favoriteSchema = new schema({
    user: {
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    dishes: [
        {
            type: schema.Types.ObjectId,
            ref: 'dish'
        }
    ]
},{
    timestamps : true
})

const Favorites = mongoose.model('favorite', favoriteSchema);

module.exports = Favorites;