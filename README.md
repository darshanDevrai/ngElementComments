![](https://firebasestorage.googleapis.com/v0/b/element-comments-demo.appspot.com/o/ngElementsComments2.png?alt=media&token=cba69781-3377-4e66-bd12-a95b9fad9a04)
# NgElementComments:  Your own commenting system made with Angular Elements and Firebase

No page views limits. You pay only for the firebase resources you use.🤩

![](https://firebasestorage.googleapis.com/v0/b/element-comments-demo.appspot.com/o/Screenshot%202019-11-11%20at%209.55.10%20PM.png?alt=media&token=2ef0212c-0a4e-44ff-bca2-e2905d55b543)

**Built with -**
1. Firebase auth (For authentication)
2. firebase firestore (database for comments)
3. firebase functions (to deleted nested collection and subcollection from firestore)
4. firebase hosting (to host our web component)

Firebase offers very cost effective pricing. It is really free to get started for small bloggers.

## Demo 
https://codersloth.github.io/ngElementCommentsDemo/

## How to build it 
If you know Angular then dive into the code right away. Its very simple.

If you don't know Angular don't worry. You don't have to write any code. It's just copy, pasting and running some commands.

First, Install Angular-cli if not installed.
```
npm install @angular/cli
```
Clone or download this repository.

Run 
```
npm install
cd functions 
npm install
cd ..
```
This will install all required packages.

Create firebase account and new project . Add web app to the new project by clicking add app. 

You will get firebase configurations. Copy this config and paste it into src -> environments -> environments.ts and environment.prod.ts

In firebase console go to Authentication and set up sign in. Enable google auth and add support email.

In firebase console, go to Database and create firestore database. Select test mode(Don’t worry about the security rules. We will override it) and next and select location. 

You can check your comments on local machine by following command - 
```
ng serve
```
Go to http://localhost:4200/ 
*Note - We have not yet deployed our function to delete nested replies. So it won't work yet.*

Install firebase Cli using - 
```
npm install -g firebase-tools
```

Sign into Firebase using your Google account by running the following command:
```
firebase login
```
Firestore clients does not support deletion of collection and subcollection. See here - https://firebase.google.com/docs/firestore/solutions/delete-collections

We are using cloud function to delete collections and subcollections of comments and replies. This function use firebase-tools on server side. We need to set CI token for it. Run following command - 
 ```
 firebase login:ci
 ```
You will get a token value like:
```
e.g - 
✔  Success! Use this token to login on a CI server:

Z/A01c9zOI74FUgPJm5aEN9d2XyTKPgQkRlePQigxBBCSOUQ_0ktLW4mfAX3x4rFLL
```
Run 
```
firebase functions:config:set fb.token=“YOUR_TOKEN”
e.g. - 
firebase functions:config:set fb.token="Z/A01c9zOI74FUgPJm5aEN9d2XyTKPgQkRlePQigxBBCSOUQ_0ktLW4mfAX3x4rFLL"
```

Now run - 
```
npm run build:elements
```
This will create our web component with ng-element-comments.js file in public directory. 

***Note - If you are already using firestore in your project then don't run below command. This repository contains firestore security rules in `firestore.rules` file which will be uploaded with the `firebase deploy` command. This will overrride your existing security rules if any. To prevent this run `firebase deploy --only hosting` and `firebase deploy --only functions`. Add the rules from `firestore.rules` file in your security rules.***

Finally run - 
```
firebase deploy
```
It will deploy our app and gives us hosting url like e.g - `https://<YOUR-APP>.firebaseapp.com`

Append `/ng-element-comments.js` to this url like e.g.  - 
  `https://<YOUR-APP>.firebaseapp.com/ng-element-comments.js`.

We need this url to load our comment component in static website or anywhere. 

## How to use it in our websites - 
Now that we have build our commenting system, lets see how to use it with our website.

Add following scripts in your website. 
*Note - we use material icons so add it too in your website.*

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/2.2.10/custom-elements-es5-adapter.js"></script>
<script type="text/javascript" src=“<OUR LINK GENERATED ABOVE>“></script>
<!--
e.g. - 
<script type="text/javascript" src=" https://my-app.firebaseapp.com/ng-element-comments.js "></script> 
-->
```
Now in your page below blog or something like that add -

```html
 <ng-element-commnets parent-id=“1”></ng-element-commnets>
```
Each blog or entity must have their own unique id. Parent id should be unique across your website to easily identify unique entities. Pass these ids as parent-id to our ng-element-commnets web component. 

That's it:)

## Limitations 
1. As of now, only Google Auth is supported. That will change soon.
2. Bundle size - 1.2 mb for ng-element-comments.js. 😱 Thanks to firebase hosting which already gzips all of our files by default, the bundle size is **279kb**.😊 Hopefully, we will get smaller bundles with the [Ivy](https://blog.angular.io/a-plan-for-version-8-0-and-ivy-b3318dfc19f7). 

## Issues & Contributing
Feel free to submit issues and enhancement requests. All contributions are welcomed.😊















