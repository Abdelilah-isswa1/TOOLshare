import mongoose from 'mongoose'

const Store = new mongoose.Schema({

    name : {
        type : String,
        required : true,
        trim : true
    },

    adresse : {
        type : String,
        required : true,
        trim : true
    },

    site : {
        type : String,
        required : true,
        trim : true
    },

    isActive : {
        default : true
    }
})