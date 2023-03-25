// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // add your firebase config below
  firebase :  {
    apiKey: "AIzaSyBMeO3BYgJXByci0u1zIoqfP9zSdyQaBgs",
    authDomain: "ngelementcomments-65c13.firebaseapp.com",
    projectId: "ngelementcomments-65c13",
    storageBucket: "ngelementcomments-65c13.appspot.com",
    messagingSenderId: "1066144449401",
    appId: "1:1066144449401:web:3fa70cf133f13eb47d65a8"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
