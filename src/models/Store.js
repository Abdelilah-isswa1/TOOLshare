import mongoose from 'mongoose'

const StoreSchema = new mongoose.Schema({

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
        type : Boolean,
        default : true
    }
}, {timestamps : true});