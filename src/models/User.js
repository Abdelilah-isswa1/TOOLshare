const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ROLES = require('../constants/roles');

const SALT_ROUNDS = 12;

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true },
        lastName: {
            type: String,
            required: true,
            trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true },
        password: {
            type: String,
            required: true,
            select: false },
        role: {
            type: String,
            enum: Object.values(ROLES),
            required: true,
            default: ROLES.USER,
        },
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store' },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' },
        isActive: {
            type: Boolean,
            default: true },
    },
    { timestamps: true }
);

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

UserSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);