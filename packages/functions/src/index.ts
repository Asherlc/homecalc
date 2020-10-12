import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const firestore = admin.firestore();
const auth = admin.auth();

export const addUserToWorkspace = functions.https.onCall(
  async ({ email, workspaceId }) => {
    functions.logger.log("logging context", email, workspaceId);

    const workspace = firestore.doc(`/workspaces/${workspaceId}`);

    const userToAdd = await auth.getUserByEmail(email);

    await workspace.update({
      owners: admin.firestore.FieldValue.arrayUnion(userToAdd.uid),
    });

    return "Looks good";
  }
);
