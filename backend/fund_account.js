const mongoose = require("mongoose");
const ledgerModel = require("./src/models/ledger.model.js");
const accountModel = require("./src/models/account.model.js");
const transactionModel = require("./src/models/transaction.model.js");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const accounts = await accountModel.find();
    if (accounts.length > 0) {
        for (let account of accounts) {
            const tx = await transactionModel.create({
                fromAccount: account._id,
                toAccount: account._id,
                amount: 5000,
                idempotencyKey: `init-${account._id}-${Date.now()}`,
                status: "COMPLETED"
            });
            await ledgerModel.create({
                account: account._id,
                amount: 5000,
                type: "CREDIT",
                transaction: tx._id
            });
            console.log(`Added 5000 to account ${account._id}`);
        }
    } else {
        console.log("No accounts found to fund.");
    }
    process.exit(0);
});
