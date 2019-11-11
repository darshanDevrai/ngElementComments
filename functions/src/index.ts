import * as functions from 'firebase-functions';

const firebase_tools = require('firebase-tools');

// import * as cors from 'cors';
// const cors = require('cors')({origin: true});

import * as admin from 'firebase-admin';
admin.initializeApp();

const fstore = admin.firestore();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//


export const deleteFStoreDoc = functions.https.onCall((data, context) => {
    // Only allow admin users to execute this function.
    if (!(context.auth && context.auth.token)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Must be logged in user to initiate delete.'
      );
    }

    const path = data.path;
    // console.log(
    //   `User ${context.auth.uid} has requested to delete path ${path}`
    // );

    return fstore.doc(path).get().then((docSnap)=>{
        if(docSnap.exists){
            
            const doc = docSnap.data();
            // console.log("-->>docSnap.exists ", doc);
            //  @ts-ignore:
            if(doc.authorId === context.auth.uid){
                // console.log("-->>isAuthor of the reply");
                // proceed deletion
                // Run a recursive delete on the given document or collection path.
                // The 'token' must be set in the functions config, and can be generated
                // at the command line by running 'firebase login:ci'.
                return firebase_tools.firestore
                .delete(path, {
                project: process.env.GCLOUD_PROJECT,
                recursive: true,
                yes: true,
                token: functions.config()
                .fb.token
                })
                .then(() => {
                    // console.log("-->>Deleleted successfully!!!");
                    return {
                        path: path 
                    };
                });
            }else{
                // console.log("-->>is not the Author of the reply");
                throw new functions.https.HttpsError('permission-denied', `Not the author of comment or reply.`);
            }
        }else{
            // console.log("-->>docSnap. does not exists");
            throw new functions.https.HttpsError('not-found', `Does not exist the document.`);
        }
    }).catch(err=>{
        throw new functions.https.HttpsError('unknown', `Something went wrong.`);
    });
    // return `User ${context.auth.uid} has requested to delete path ${path}`;

    
  });
