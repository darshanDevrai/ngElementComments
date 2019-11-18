import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { DataService } from '../../services/data/data.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom 
})
export class MainComponent implements OnInit,OnDestroy {
   // All subscriptions are stored in these variable and unsubscribed in ngOnDestroy
   private authSubscription: Subscription;
   private dataSubscription: Subscription;
   ngOnDestroy(): void {
     if(this.authSubscription && this.authSubscription instanceof Subscription){
       this.authSubscription.unsubscribe();
     }
     if(this.dataSubscription && this.dataSubscription instanceof Subscription){
       this.dataSubscription.unsubscribe();
     }
   }

  @Input()
  parentId:string;

  _user: User;

  // Doc id for comment parent doc
  commentDocUid:string;

  // Number of comments 
  noOfComments:number;

  showError:boolean = false;

  errMsg:string = "";

  constructor(
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private db: AngularFirestore,
    private dataService:DataService
    
  ) { 
    this.authSubscription = this.authService.user$.subscribe((user)=>{
      this._user = user;
    });
  }

  ngOnInit() {


    // this.db.collection("comments").ref.where("parentId", "==", this.parentId).limit(1)
    this.db.collection("comments").doc(`entity::${this,this.parentId}`).ref
    .get().then(docSnapshot =>{
      if(docSnapshot.exists){
        // this.noOfComments = docSnapshot.docs[0].data().noOfComments;
        // this.commentDocUid = docSnapshot.docs[0].id;
        // console.log("NoOfComments are", docSnapshot.docs[0].data());
        this.noOfComments = docSnapshot.data().noOfComments;
        this.commentDocUid = docSnapshot.id;
        // console.log("NoOfComments are", docSnapshot.data());
        this.cd.detectChanges();
      }else{
        if(this.parentId != undefined){
          this.createComDoc();
        }
        
      }
    }).catch(err=>{
      this.dataService.showError("Something went wrong:( Please try again later.");
    });
    this.cd.detectChanges();

    this.dataSubscription = this.dataService.showErr$.subscribe((errMsg)=>{
      if(errMsg != null){
        // destroy old msg if showing
        this.showError = false;
        this.cd.detectChanges();

        this.errMsg = errMsg;
        this.showError = true;
        this.cd.detectChanges()
      }
    });


  }

  private createComDoc(){
    const docId = `entity::${this,this.parentId}`;
    this.db.collection("comments").doc(docId)
    .set({
      noOfComments : 0,
      parentId : this.parentId
    }).then(value =>{
      this.commentDocUid = docId;
      this.noOfComments = 0;
      this.cd.detectChanges();
      // console.log("comDoc was not present so it was created => ", this.parentId);
    }).catch(err=>{
      // console.log("Error while creating com doc ", err);
      this.dataService.showError("Something went wrong:( Please try again later.");
    })
  }

  noOfCommentsChanged(noOfComments){
    this.noOfComments = noOfComments;
    this.cd.detectChanges();
  }


  closeError(event){
    this.showError = false;
    this.cd.detectChanges();
  }
  

}
