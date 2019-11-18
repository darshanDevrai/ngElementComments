// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // add your firebase config below
  firebase :  {
    apiKey: "AIzaSyAU_cDwS7PWwczqnw9GcE10boDCT0TZXAs",
    authDomain: "ng-el-comments.firebaseapp.com",
    databaseURL: "https://ng-el-comments.firebaseio.com",
    projectId: "ng-el-comments",
    storageBucket: "ng-el-comments.appspot.com",
    messagingSenderId: "1059906119695",
    appId: "1:1059906119695:web:6494b2051e41154b429b7a",
    measurementId: "G-E9FXQRXNJW"
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
