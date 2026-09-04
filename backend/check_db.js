const mongoose = require("mongoose");
const accountModel = require("./src/models/account.model.js");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const toAcc = await accountModel.findOne({ _id: "6a9afa5e7621bdc292b2b77a" });
    console.log("Dummy recipient account exists:", !!toAcc);

    const allAccs = await accountModel.find();
    console.log("Total accounts in DB:", allAccs.length);

    process.exit(0);
});
