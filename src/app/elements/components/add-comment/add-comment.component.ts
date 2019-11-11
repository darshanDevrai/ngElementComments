import { Component, OnInit, ViewChild, ChangeDetectorRef, Input, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../models/user.model';
import { LinkifyService } from '../../services/linkify/linkify.service';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { CommentModel } from '../../models/comment.model';
import { DataService } from '../../services/data/data.service';
// import { CommentModel } from '../../models/comment.model';

@Component({
  selector: 'app-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCommentComponent implements OnInit {

  @ViewChild('myInput', { static: true }) topCommentInput; 
  showButton: boolean = false;
  disableCommentButton: boolean = false;

  _user: User;
  allSubscriptions:Subscription;

  @Input()
  commentDocUid:string;

  // ngModel for writing comment
  commentBody: string = ''; // for comment string;

  constructor(
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private db: AngularFirestore,
    private linkifyService: LinkifyService,
    private dataService: DataService
  ) { 
    this.allSubscriptions = this.authService.user$.subscribe((user)=>{
      this._user = user;
      this.cd.detectChanges();
    });
  }

  ngOnInit() {
  }

  // WHen Focused show buttons for top comment
  inputFocused(isFocus){
    if(isFocus == true && !this._user){
      this.authService.googleSignin();
    }
    if(this.topCommentInput.isFocus == true){
      this.showButton = true;
    }
    this.cd.detectChanges();
  }
  // Cancel top comments
  cancelTopComment(){
    this.topCommentInput.clearTheTextField();
    this.showButton = false;
    this.cd.detectChanges();
  }

  // ###### EDITOR VALUES 
  comValueChange(commBody){
    // console.log("comment body in comments is ", commBody);
    this.commentBody = commBody;
  }

  addComment(){
    if( !this._user){
      return this.authService.googleSignin();
    }
    // if blank then return
    // console.log("Username in addComment is ", this.userData.userName);
    if(this.commentBody.length == 0 || this.commentBody == ''){
      this.dataService.showError('Comment body is empty');
      return;
    }else{
      this.disableCommentButton = true;
      this.cd.detectChanges();
      // this.linkifyService.printIt();
      // console.log("linkify calling");
      const linkifyedComentBody = this.linkifyService.linkifyIt(this.commentBody);
      // console.log("after linkify");
      const docId = this.db.createId();
      // const docId1 = this.db.collection("comments").ref.doc().id;
      // console.log("Doc id is ", docId);
      // console.log("Doc id1 is ", docId1);
      const batch = this.db.firestore.batch();
      const docToAdd:CommentModel = {
        authorId: this._user.uid,
        author: this._user.displayName,
        authorPhotoURL : this._user.photoURL,
        commentBodyHtml : linkifyedComentBody.html,
        commentBodyText : linkifyedComentBody.text,
        commentLikes : 0,
        noOfReplies : 0,
        docId: docId
      }
      docToAdd.timeStamp = firebase.firestore.FieldValue.serverTimestamp();
      
      // console.log("docId is ", docToAdd);
      
      // this.db.collection("comments").doc(this.typeParentId).collection("comments").doc(docId)
      // .set(docToAdd)

      const newComRef = this.db.collection("comments").doc(this.commentDocUid).
                      collection("comments").doc(docId).ref;

      batch.set(newComRef,docToAdd);
      const comDocRef = this.db.collection("comments").doc(this.commentDocUid).ref;
      batch.update(comDocRef,{
        noOfComments : firebase.firestore.FieldValue.increment(1)
      })
      batch.commit()
      // this.db.collection("comments").doc(docId).set(docToAdd)
      .then((docRef) => {
          // add new commnet in local array
          const date = new Date(); 
          docToAdd.localTime = date.getTime();// local time
          docToAdd.userLiked = false;
          // docToAdd.replies = [];
          // docToAdd['userLiked'] = false;
          // this.noOfComments = this.noOfComments + 1;
          // this.noOfCommentsChanged.emit(this.noOfComments);
          // this.comments.unshift(data);
          this.dataService.addCommentToArray(docToAdd);
          //clear the commentBody
          this.commentBody = "";
          this.disableCommentButton = false;
          // this.commentInputComponent.clearTheTextField();
          this.topCommentInput.clearTheTextField();
          this.cd.detectChanges();
      })
      .catch((error) =>{
          // console.error("Error adding Comment: ", error);
          this.dataService.showError('Error while adding a Comment. Please try again later.');
          this.disableCommentButton = false;
          this.cd.detectChanges();
      });
    }
    

  }


}
