const UserRepository = require('../repositories/userRepository')

const { hashPwd } = require('../utils/hashedPassword');

const comparePassword = require('../utils/comparePassword');

const generateToken = require("../utils/generateToken");

const generateCode = require("../utils/generateOTP")

const sendEmail = require("../utils/sendEmail")

class AuthService {

    constructor() {
        this.UserRepository = new UserRepository();
    }

    //Having middleware to check credentials
    async signIn(credentials) {
        const { usernameOrEmail, password } = credentials;

        let user;


        try {
            if (usernameOrEmail.includes('@')) {
                user = await this.UserRepository.getUserByEmail(usernameOrEmail);
            } else {
                user = await this.UserRepository.getUserByUsername(usernameOrEmail);
            }

            if (!user) {
                return { success: false, message: 'User not found.' };
            }

            const match = await comparePassword(password, user.password)

            if (!match) {
                return { success: false, message: 'Invalid Credentials' }
            }

            if (!user.isVerified) {
                return { success: false, message: 'Please verify your account' }
            }

            const token = generateToken(user);

            return {
                success: true,
                token,
                user: { _id: user._id, email: user.email, username: user.username, role: user.role },
            };

        } catch (error) {
            console.error('Error during signIn:', error);
            return { success: false, message: 'Something went wrong. Please try again later.' };
        }
    }

    async signInByFacebook() {

    }

    async signUp(credentials) {

        try {
            const {email, phoneNumber, username, password} = credentials ; 

            const isExisted = await this.UserRepository.getUserByEmail(email);

            if (isExisted) {
                return {success: false , message: "Email existed"}
            }

            const hashedPassword = await hashPwd(password);
            const newUser = {email, phoneNumber, username, password: hashedPassword, facebookId: null} ; 


            const createdUser = await this.UserRepository.createUser(newUser);

            if (createdUser) {
                return { success: true, message: "User created successfully" };
            } else {
                return { success: false, message: "Failed to create user. Please try again." };
            }


        }

        catch(error) {
            console.error('Error during signUp:', error);
            return { success: false, message: 'Something went wrong. Please try again later.' }; 
        }
        

        
    }

    async verifyEmail(email) {
        
        const user = await this.UserRepository.getUserByEmail(email);

        if (!user) {
            return {success: false, message: "User not found"}
        }

        if (user.isVerified) {
            return {success: false, message: "User has been verified" }
        }

        const code = generateCode()

        user.verificationCode = code 

        await user.save()

        await sendEmail({
            emailTo: user.email, 
            subject: "Email verification code",
            code,
            content: "verify your account",
        })

        return {success: true, message: "User email verification sent successfully"}


        
    }

    async verifyUser(email, code) {
        const user = await this.UserRepository.getUserByEmail(email);

        if (!user) {
            return {success: false, message: "User not found"}
        }

        if (user.verificationCode !== code) {
            return {success: false, message: "Invalid code" }
        }

        user.isVerified = true ; 
        user.verificationCode = null ; 
        
        await user.save();

        return {success: true , message: "User verified successfully"}


    }

    //Cần phải OTP qua email
    async resetPassword(email, newPassword) {
        const user = await this.UserRepository.getUserByEmail(email);

        if (!user) {
            return { success: false, message: "User not found" };
        }

        const hashedPassword = await hashPwd(newPassword);
        user.password = hashedPassword;
        await user.save();

        return { success: true, message: "Password has been reset successfully" };

    }

    

    // async verifyToken(token) {
    //     try {
    //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //         return decoded;
    //     } catch (error) {
    //         throw new Error('Invalid or expired token.');
    //     }
    // }

    // async signUpFast(email) {
    //     const isExisted = await this.UserRepository.getUserByEmail(email);

        

        



    // }



}

module.exports = AuthService