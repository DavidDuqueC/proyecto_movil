const admin = require("firebase-admin");
const svcAcc = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(svcAcc),
  databaseURL: "https://express-63670-default-rtdb.firebaseio.com/"  
});

const db = admin.database();
module.exports = db;