import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    if(this.authSubscription && this.authSubscription instanceof Subscription) {
      this.authSubscription.unsubscribe();
    }
  }

  _user:User;
  authSubscription:Subscription;


  constructor(
    private cd: ChangeDetectorRef,
    private db: AngularFirestore,
    private authService: AuthService,
  ) {
     this.authSubscription = this.authService.user$.subscribe((user)=>{
       this._user = user;
       this.cd.detectChanges();
     });
   }

  ngOnInit() {

  }

  signIn(){
    this.authService.googleSignin();
  }

  signOut(){
    this.authService.signOut();
  }



}
