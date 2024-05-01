import admin from "firebase-admin";
import { configs } from ".";

admin.apps.length === 0 &&
  admin.initializeApp({
    credential: admin.credential.cert({
      clientEmail: configs.CLIENT_EMAIL,
      privateKey: configs.PRIVATE_KEY,
      projectId: configs.PROJECT_ID,
    }),
    // databaseURL: "https://arvind-technocrat-default-rtdb.firebaseio.com",
  });

export { admin };
