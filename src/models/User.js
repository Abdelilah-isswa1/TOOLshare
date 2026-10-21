import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

const UserSchema = new mongoose.Schema({

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
        type : Boolean,
        default :true
    }
},{ timestamps: true });

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
        next();
    } catch (err) {
        next(err);
    }
});

UserSchema.methods.comparePassword = function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;