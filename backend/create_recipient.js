const mongoose = require("mongoose");
const userModel = require("./src/models/user.model.js");
const accountModel = require("./src/models/account.model.js");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    // create a dummy user
    const dummyUser = await userModel.create({
        email: `dummy${Date.now()}@test.com`,
        name: "Test Recipient",
        password: "password123"
    });
    
    // create a dummy account for them
    const dummyAccount = await accountModel.create({
        user: dummyUser._id,
        status: "ACTIVE",
        currency: "INR"
    });
    
    console.log(`\n\n--- SUCCESS ---`);
    console.log(`Here is a valid Recipient Account ID to test with: ${dummyAccount._id}`);
    console.log(`----------------\n\n`);
    
    process.exit(0);
});
