import mongoose from 'mongoose'

const ReservationSchema = new mongoose.Schema({

    dateDebut : {
        type : Date,
        required : true
    },

    dureeHeures : {
        type : Number,
        required : true,
        min : 1
    },

    dateFin : {
        type : Date,
        required : true
    },

    statut : {
        type : String,
        enum : ["CONFIRMEE","ANNULEE","EN_COURS","TERMINEE"],
        default : "CONFERMEE"
    }
})