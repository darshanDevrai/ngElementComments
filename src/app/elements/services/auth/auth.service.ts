import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { auth } from 'firebase/app';
import {  Observable, of } from 'rxjs';
import { switchMap} from 'rxjs/operators';

import { User } from '../../models/user.model';
import { DataService } from '../data/data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$ : Observable<User> = of(null);

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private dataService:DataService
    ) {
      this.user$ = this.afAuth.authState;
      // .pipe(
      //   switchMap(user => {
      //     if(user){
      //       return this.db.doc<User>(`users/${user.uid}`).valueChanges();
      //     }else{
      //       return of(null);
      //     }
      //   })
      // );
     }

     async googleSignin() {
      const provider = new auth.GoogleAuthProvider();
      try{
        const credential = await this.afAuth.auth.signInWithPopup(provider);
        // return this.updateUserData(credential.user);
      }catch(err){
        if(err.code == "auth/network-request-failed"){
          return this.dataService.showError("Network error. Unable to login. Please try agian later.");
        }else if(err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request'){
          return this.dataService.showError("Something went wrong. Please try agian later.");
        }
      }
      
    }

    async signOut(){
        await this.afAuth.auth.signOut();
    }

    // private updateUserData(user) {
    //   // Sets user data to firestore on login
    //   const userRef: AngularFirestoreDocument<User> = this.db.doc(`users/${user.uid}`);
  
    //   const data = { 
    //     uid: user.uid, 
    //     email: user.email, 
    //     displayName: user.displayName, 
    //     photoURL: user.photoURL
    //   } 
  
    //   return userRef.set(data, { merge: true })
  
    // }


}


