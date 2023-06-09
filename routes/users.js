const express = require("express");
const router = express.Router();
const { UserModel, validateJoi, createToken, validateLogin } = require("../models/userModel")
const bcrypt = require("bcrypt");
const {auth} = require("../middleware/auth")

router.get("/userInfo", auth, async (req, res) => {
    try {
        let user = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
        res.json(user);
    }
    catch (err) {
        console.log(err);
        return res.status(502).json({ err })
    }
})

router.post("/", async (req, res) => {
    let validBody = validateJoi(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let user = new UserModel(req.body);
        user.role = "user";
        user.password = await bcrypt.hash(user.password, 10);
        await user.save();
        user.password = "*******";
        return res.status(201).json(user);
    }
    catch (err) {
        if (err.code = 11000) {
            return res.status(400).json({ msg: "This email is alresdy in the system", code: 11000 });
        }
        console.log(err);
        return res.status(502).json({ err })
    }
})

router.post("/login", async (req, res) => {
    let validBody = validateLogin(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let user = await UserModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ err: "The email has not been found" });
        }
        let passwordValid = await bcrypt.compare(req.body.password, user.password);
        if (!passwordValid) {
            return res.status(401).json({ err: "The password you have entered is wrong" });
        }
        let token = createToken(user._id);
        return res.json({token});
    }
    catch (err) {
        console.log(err);
        return res.status(502).json({ err })
    }
})

module.exports = router;