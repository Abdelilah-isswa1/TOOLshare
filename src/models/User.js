import mongoose from 'mongoose'

const User = new mongoose.Schema({

    firstName : {
        type : String,
        required : true,
        trim : true
    },

    lastName: {
        type : String,
        required : true,
        trim : true
    },

    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true
    },

    password : {
        type : String,
        required : true,
        select : false
    },

    role : {
        type : String,
        enum : ['admin','gestionnaire', 'user'],
        required : true,
        default : 'user'
    },

    isActive : {

        default :true
    }
}, {timestamps : true});