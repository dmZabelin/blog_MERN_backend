import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({email: req.body.email});

        if(!user) {
            return res.status(404).json({
                message: 'Authorisation Error'
            })
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

        if(!isValidPass) {
            return res.status(404).json({
                message: 'Authorisation Error'
            })
        }

        const {passwordHash, ...userData} = user._doc;

        const token = jwt.sign({
                _id: user._id
            }, 'secret_user',
            {
                expiresIn: "30d"
            })

        res.json({
            ...userData,
            token
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Failed to login."})
    }
}

export const signup = async (req, res) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt)

        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash
        })

        const user = await doc.save();

        const {...userData} = user._doc;

        const token = jwt.sign({
                _id: user._id
            }, 'secret_user',
            {
                expiresIn: "30d"
            })

        res.json({
            ...userData,
            token
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Failed to signup."})
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        if(!user) {
            return res.status(404).json({
                message: "User not found!"
            })
        }
        const {passwordHash, ...userData} = user._doc;
        res.json(userData)
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'No access',
        })
    }
}