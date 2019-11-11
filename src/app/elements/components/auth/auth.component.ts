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
    if(this.allSubscriptions){
      this.allSubscriptions.unsubscribe();
    }
  }

  _user:User;
  allSubscriptions:Subscription;


  constructor(
    private cd: ChangeDetectorRef,
    private db: AngularFirestore,
    private authService: AuthService,
  ) {
     this.allSubscriptions = this.authService.user$.subscribe((user)=>{
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
