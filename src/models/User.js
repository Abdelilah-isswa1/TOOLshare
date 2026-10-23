import mongoose from 'mongoose'
const bcrypt = require('bcryptjs');

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

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;