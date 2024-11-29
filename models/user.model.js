const mongoose = require("mongoose");
const generate = require("../helpers/generate");

const roleSchema = new mongoose.Schema(
    {
        fullname: String,
        email: String,
        password: String,
        token:{
            type: String,
            default: generate.generateRandomString(30)
        },
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


const User = mongoose.model('User', roleSchema, "users");

module.exports = User;

