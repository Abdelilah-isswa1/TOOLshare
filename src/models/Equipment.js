import mongoose from 'mongoose'

const EquipmentSchema = new mongoose.Schema({

    name : {
        type : String,
        required : true,
        trim : true
    },

    reference : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        uppercase : true
    },

    description : {
        type : String
    },

    etatMateriel : {
        type : String,
        enum : ["BON","ENDOMMAGE","EN_MAINTENANCE","HORS_SERVICE"],
        default : "BON",
        uppercase : true
    },

    disponible : {
        type : Boolean,
        default : true
    }

}, {timestamps : true});