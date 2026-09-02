const mongoose = require("mongoose");
const ledgerModel = require("./backend/src/models/ledger.model.js");
const accountModel = require("./backend/src/models/account.model.js");
require("dotenv").config({ path: "./backend/.env" });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const accounts = await accountModel.find();
    if (accounts.length > 0) {
        for (let account of accounts) {
            await ledgerModel.create({
                account: account._id,
                amount: 5000,
                type: "CREDIT"
            });
            console.log(`Added 5000 to account ${account._id}`);
        }
    } else {
        console.log("No accounts found to fund.");
    }
    process.exit(0);
});
