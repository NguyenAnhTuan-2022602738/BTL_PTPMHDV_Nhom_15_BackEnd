const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
    {
        fullname: String,
        email: String,
        password: String,
        token: String,
        phone: String,
        avatar: String,
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date,
    },
    {
        timestamps: true
    }
);


const Account = mongoose.model('Account', accountSchema, "accounts");

module.exports = Account;