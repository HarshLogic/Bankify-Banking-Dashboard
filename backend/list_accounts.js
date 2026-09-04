const mongoose = require("mongoose");
const accountModel = require("./src/models/account.model.js");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const accounts = await accountModel.find().populate('user', 'email name');
    console.log("Existing Accounts:");
    accounts.forEach(acc => {
        console.log(`ID: ${acc._id} | User: ${acc.user ? acc.user.name : 'Unknown'}`);
    });
    process.exit(0);
});
