const mongoose = require("mongoose");
const accountModel = require("./src/models/account.model.js");
const transactionController = require("./src/controllers/transaction.controller.js");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const fromAccount = await accountModel.findOne({ status: "ACTIVE" });
    const toAccount = await accountModel.findOne({ _id: "6a9afa5e7621bdc292b2b77a" }); // the dummy account

    console.log(`From: ${fromAccount._id}, Balance: ${await fromAccount.getBalance()}`);
    console.log(`To: ${toAccount._id}, Balance: ${await toAccount.getBalance()}`);

    const req = {
        body: {
            fromAccount: fromAccount._id.toString(),
            toAccount: toAccount._id.toString(),
            amount: 100,
            idempotencyKey: `test-${Date.now()}`
        },
        user: { email: "test@test.com", name: "Test User" }
    };

    const res = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            console.log(`Status: ${this.statusCode}`);
            console.log("Response:", data);
            process.exit(0);
        }
    };

    await transactionController.createTransaction(req, res);
});
