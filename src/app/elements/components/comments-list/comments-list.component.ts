import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../models/user.model';
import {  CommentModel } from '../../models/comment.model';
import * as firebase from 'firebase/app';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data/data.service';
import { LinkifyService } from '../../services/linkify/linkify.service';
import { ReplyModel } from '../../models/reply.model';
import { replyData } from '../../models/replyData.model';
import { AngularFireFunctions } from '@angular/fire/functions';

@Component({
  selector: 'app-comments-list',
  templateUrl: './comments-list.component.html',
  styleUrls: ['./comments-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentsListComponent implements OnInit,OnDestroy {

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


  // Array holding comments
  comments: Array<CommentModel> = [];


  /* 
  As commentBody is always visible, If we use same commentBody for updating then 
  It will reflect it in the write a comment section too, Therefore, a new variable is 
  used for updating comment.
  */
  updateCommentBody: string = ''; 
  disableUpdateCommentButton: boolean = false;

  // Same thing for updating reply.
  updateReplyBody: string = ''; 

  // ngModel for writing reply 
  replyBody: string = ''; 
  disableReplyButton: boolean = false;

  /* 
  This is used to toggle reply buttons with one button passes docId, while other button 
  passes 'false' to toggle it. Then this uid is used to uniquely identify comment whoes reply
  button is clicked and shows only 'add reply' section for that comment. Only one comment's 
  'add reply' section is visible at a time.
  */
  comReplyUid:any = false;

  // same as above
  innerReplyUid:any = false;

  //  for writing inner reply
  innerReplyBody: string = '';

  // Array holding replies
  replies: Array<any> = [];

  // Flag to show loading indicator until replies are fetched from firestore
  showLoadingReplies: boolean[] = [];

  // These variable holds last doc from firestore query which then used in 'startAfter()'
  lastCommentDoc:any;
  lastReplyDoc: any[] = [];

  // flag to show load more button or not
  loadMoreComments:boolean | string= false;

  // flag to uniquely identify which comment is being edited.
  editCommentFlag: boolean[] = [];

  // flag to uniquely identify which comment is being deleted. 
  deletingFlag: boolean[] = [];
  
  // Number of comments 
  @Input()
  noOfComments:number = 0;

  @Output() noOfCommentsChanged = new EventEmitter<number>();

  @Input()
  commentDocUid:string;


  _user:User;

  constructor(
    private db: AngularFirestore,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private dataService:DataService,
    private linkifyService:LinkifyService,
    private fns: AngularFireFunctions
  ) { 
    this.authSubscription = this.authService.user$.subscribe((user)=>{
      this._user = user;
      this.cd.detectChanges();
    });
  }

  ngOnInit() {

    this.getComments();
    this.dataSubscription = this.dataService.addComment$.subscribe((comment)=>{
          if(comment != null){
            this.noOfComments = this.noOfComments + 1;
            this.noOfCommentsChanged.emit(this.noOfComments);
            this.comments.unshift(comment);
            this.cd.detectChanges();
          }
          
    });
    
  }

  noOfRepliesChanged(noOfRepliesDoc){
    const index = noOfRepliesDoc.commentIndex;
    this.comments[index].noOfReplies = noOfRepliesDoc.noOfReplies;
    this.cd.detectChanges();
  }

  private getComments(){
    const commentsCollection: AngularFirestoreCollection<CommentModel> = this.db.collection("comments").doc(this.commentDocUid).collection("comments");
    const limit = 15;
    const query = commentsCollection.ref.orderBy('timeStamp','asc').limit(limit);

    query
        .get().then(querySnapshot => {
          // store last doc from the querySnapshot.
        this.lastCommentDoc = querySnapshot.docs[querySnapshot.docs.length-1];

        let commLength;
        querySnapshot.forEach( doc => {

          const data = doc.data() as CommentModel;
          commLength = this.comments.push(data);
          
          this.checkUserLikedComment(data.docId, commLength - 1);
        });
        // see whether to show loadmore button or not.
        if(this.noOfComments > commLength){
          this.loadMoreComments = true;
        }else{
          this.loadMoreComments = false;
        }
        this.cd.detectChanges();
      }).catch((err)=>{
        this.dataService.showError('Something went wrong:( Please try again later.');
      });
  }



    // This fn checks if the current user is liked the comments already or not.
    checkUserLikedComment(commentId, index){
      if(this._user){
        const commLikeDocId = "user::"+this._user.uid+"-"+commentId;
        // this.db.collection("commentLikes").doc(commLikeDocId).get()
        this.db.collection("comments").doc(this.commentDocUid).
                        collection("commentLikes").doc(commLikeDocId).get()
        .toPromise()
        .then(docSnapshot =>{
          // from doc exists, update this.comments' 'userLiked' field
          // If doc exists then it means user is already liked the comment.
          if(docSnapshot.exists){
            this.comments[index].userLiked = true;
          }else{
            this.comments[index].userLiked = false;
          }
          this.cd.detectChanges();
          return;
        });
      }else{
        return;
      }
      
    }

    // function which fetches next batch of comments.
  showMoreComments(){
    // for showing loading indicator
    this.loadMoreComments = 'loading';
    this.cd.detectChanges();
    const lastCommentDoc = this.lastCommentDoc;
    const comRef = this.db.collection("comments").doc(this.commentDocUid).collection("comments").ref;
    const query = comRef.limit(15).orderBy('timeStamp', 'asc').startAfter(lastCommentDoc);
     query
    .get().then(querySnapshot => {
      // update lastCOmmentDoc
        this.lastCommentDoc = querySnapshot.docs[querySnapshot.docs.length-1];
        let commLength;
        querySnapshot.forEach( doc => {
          const data = doc.data() as CommentModel;
          commLength = this.comments.push(data);
          
          this.checkUserLikedComment(data.docId, commLength - 1);
        });
      // check whether to show loadMore or not.
        if(this.noOfComments > commLength){
          this.loadMoreComments = true;
        }else{
          this.loadMoreComments = false;
        }
        this.cd.detectChanges();
      
    }).catch(err=>{
      this.loadMoreComments = true;
      this.cd.detectChanges();
      this.dataService.showError('Error geting more comments.');
    });
  }


      // set editFalg to true;
    editComment(comIndex){
      this.editCommentFlag = [];
      this.editCommentFlag[comIndex] = true;
      //set updateCommentBody to comment body of comment being edited.
      // this.updateCommentBody = this.comments[comIndex].commentBody;
      this.updateCommentBody = this.comments[comIndex].commentBodyText;
      this.cd.detectChanges();
    }

    // set editFalg to false;
    cancelUpdateComment(comIndex){
      this.editCommentFlag[comIndex] = false;
      // clear  updateComentbody
      this.updateCommentBody = '';
      this.cd.detectChanges();
    }

    // ###### EDITOR VALUES 
    updateComValueChange(commBody){
      this.updateCommentBody = commBody;
    }

      // Update edited comment
    updateComment(comIndex){
      // if blank return;
      if(this.updateCommentBody.length < 1 || this.updateCommentBody == ''){
        return;
      }else{
        this.disableUpdateCommentButton = true;
        this.cd.detectChanges();
        const linkifyedComentBody = this.linkifyService.linkifyIt(this.updateCommentBody);
        const docId = this.comments[comIndex].docId;

        this.db.collection("comments").doc(this.commentDocUid).collection("comments").doc(docId)
        .update({
            commentBodyHtml : linkifyedComentBody.html, 
            commentBodyText : linkifyedComentBody.text,
            updatedAt : firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            // reflect updated changes in local variable.
            this.comments[comIndex].commentBodyHtml = linkifyedComentBody.html;
            this.comments[comIndex].commentBodyText = linkifyedComentBody.text;
            this.disableUpdateCommentButton = false;
            // clear updateCommentBody
            this.updateCommentBody = '';
            // set updatedAt to true bcoz in html we use this field to show 'edited' string 
            // infront of timeStamp 
            this.comments[comIndex].updatedAt = 1;
            this.editCommentFlag[comIndex] = false;
            this.cd.detectChanges();
        })
        .catch((error) => {
            this.dataService.showError('Something went wrong while updating comment:(');
            this.editCommentFlag[comIndex] = false;
            this.cd.detectChanges();
        });
      }
      
    }

    deleteComment(comIndex){
      this.deletingFlag[comIndex] = true;
      this.cd.detectChanges();
      const comDocId = this.comments[comIndex].docId;
      const noOfReplies = this.comments[comIndex].noOfReplies;
      const batch = this.db.firestore.batch();
      const comDocRef = this.db.collection("comments").doc(this.commentDocUid).ref;
      batch.update(comDocRef,{
        noOfComments : firebase.firestore.FieldValue.increment(-1)
      });
      if(noOfReplies == 0){
        const commentDocRef =  this.db.collection("comments").doc(this.commentDocUid)
          .collection("comments").doc(comDocId).ref;
        batch.delete(commentDocRef);
  
        batch.commit().then(value=>{
          this.comments.splice(comIndex,1);
          this.noOfComments = this.noOfComments - 1;
          this.noOfCommentsChanged.emit(this.noOfComments);
          this.deletingFlag = [];
          this.cd.detectChanges();
        }).catch(err=>{
          this.dataService.showError('Somwthing went wrong while deleting a comment:(')
          this.deletingFlag = [];
          this.cd.detectChanges();
        })
  
      }else{
        const deleteFStoreDoc = this.fns.httpsCallable('deleteFStoreDoc');
        const deleteDoc = deleteFStoreDoc({
          path: `/comments/${this.commentDocUid}/comments/${comDocId}` 
          }).toPromise();
        deleteDoc.then(value => {
          // here decrement parents number of comments.

          batch.commit().then(value=>{
            this.comments.splice(comIndex,1);
            this.noOfComments = this.noOfComments - 1;
            this.noOfCommentsChanged.emit(this.noOfComments);
            this.deletingFlag = [];
            this.cd.detectChanges();
          }).catch(err=>{
            this.dataService.showError('Somwthing went wrong while deleting a comment:(')
            this.deletingFlag = [];
            this.cd.detectChanges();
          })
        }).catch(err=>{
          this.dataService.showError('Somwthing went wrong while deleting a comment:(')
          this.deletingFlag = [];
          this.cd.detectChanges();
        })
      }

    }

    // set comReplyUid and replyBody to display reply section
    replyCommentClicked(docId){
      if( !this._user){
        return this.authService.googleSignin();
      }
      this.replyBody = "";
      this.comReplyUid = docId;
      this.cd.detectChanges();
    }
    // hide the reply section.
    cancelReply(){
      this.comReplyUid = false;
      this.replyBody = "";
      this.cd.detectChanges();
    }

    repValueChange(replyBody){
      this.replyBody = replyBody;
    }


    addReply(comIndex){
      if( !this._user){
        return this.authService.googleSignin();
      }
      if(this.replyBody.length == 0  || this.replyBody == ''){
        this.dataService.showError('Reply body is empty.')
        return;
      }else{
        this.disableReplyButton = true;
        this.cd.detectChanges();
        const linkifyedReplyBody = this.linkifyService.linkifyIt(this.replyBody);
        const docId = this.db.createId();
        const replyTo = this.comments[comIndex].author;
        const docToAdd:ReplyModel = {
          authorId: this._user.uid,
          author: this._user.displayName,
          authorPhotoURL: this._user.photoURL,
          replyTo: replyTo,
          replyBodyHtml : linkifyedReplyBody.html,
          replyBodyText : linkifyedReplyBody.text,
          commentId : this.comReplyUid,
          replyLikes : 0,
          noOfReplies : 0,
          docId : docId
        }
        docToAdd.timeStamp = firebase.firestore.FieldValue.serverTimestamp();
        const batch = this.db.firestore.batch();
        const replyDocRef = this.db.collection("comments").doc(this.commentDocUid)
                            .collection("comments").doc(this.comReplyUid)
                            .collection("replies").doc(docId).ref;
        
        batch.set( replyDocRef, docToAdd);
  
        const commentDocRef = this.db.collection("comments").doc(this.commentDocUid)
                            .collection("comments").doc(this.comReplyUid).ref;
        batch.update(commentDocRef, {
          noOfReplies : firebase.firestore.FieldValue.increment(1)
        });
  
        batch.commit()
        .then((docRef) => {
            // add new commnet in local array
            let date = new Date(); 
            docToAdd.localTime = date.getTime();// local time
            const sendData:replyData = {
              commentId : this.comReplyUid,
              reply : docToAdd
            }
            this.dataService.addReplyToArray(sendData);
            this.comReplyUid = false;
            this.replyBody = "";
            this.disableReplyButton = false;
            this.cd.detectChanges();
        })
        .catch((error) =>{
          this.disableReplyButton = false;
            this.cd.detectChanges();
            this.dataService.showError('Somwthing went wrong while adding a reply:(')
        });
      }
    }

    likeCommentClicked(comIndex){
      if( !this._user){
        return this.authService.googleSignin();
      }
      // change local data first 
      this.comments[comIndex].commentLikes = this.comments[comIndex].commentLikes + 1;
      this.comments[comIndex].userLiked = true;
      this.cd.detectChanges();
      const commId = this.comments[comIndex].docId;
      const userId = this._user.uid;
      const commLikeDocId = "user::"+userId+"-"+commId;
      const comLikesRef = this.db.collection("comments").doc(this.commentDocUid).
                        collection("commentLikes").doc(commLikeDocId).ref;
      comLikesRef.get().then((commLikedDoc) =>{
        if (!commLikedDoc.exists) {
          // doc doesnt exist means not already liked. So proceed to like.
          const batch = this.db.firestore.batch();
          const docToAdd = {
            commentId : commId,
            userId : userId
          }
          batch.set(comLikesRef, docToAdd);

          const commRef = this.db.collection("comments").doc(this.commentDocUid)
                                    .collection("comments").doc(commId).ref;

          // update the commentLikes counter in comment doc.
          batch.update(commRef, {
            commentLikes : firebase.firestore.FieldValue.increment(1)
          });

          batch.commit()
          .then(sucess =>{
              this.cd.detectChanges();
          })
          .catch(err=>{
            this.dataService.showError('Somwthing went wrong while liking a comment:(')
            // revert the local changes which were done at the begining of this function.
            this.comments[comIndex].userLiked = false;
            this.comments[comIndex].commentLikes = this.comments[comIndex].commentLikes - 1;
            this.cd.detectChanges();
          });
        }else{
          // revert the local changes which were done at the begining of this function as user 
          // already liked this comment.
          // this.comments[comIndex].userLiked = false;
          this.comments[comIndex].commentLikes = this.comments[comIndex].commentLikes - 1;
          this.cd.detectChanges();
          return;
        }
      })
  
    }

    unLikeCommentClicked(comIndex){
      if( !this._user){
        return this.authService.googleSignin();
      }
      // change local data first 
        this.comments[comIndex].commentLikes = this.comments[comIndex].commentLikes - 1;
        this.comments[comIndex].userLiked = false;
        this.cd.detectChanges();
        const commId = this.comments[comIndex].docId;
        const userId = this._user.uid;
        const commLikeDocId = "user::"+userId+"-"+commId;
        const comLikesRef = this.db.collection("comments").doc(this.commentDocUid).
                          collection("commentLikes").doc(commLikeDocId).ref;
        comLikesRef.get().then((commLikedDoc) =>{
          if (!commLikedDoc.exists) {
            // doc doesnt exist means not already liked. So dont proceed to unlike.
            this.comments[comIndex].userLiked = true;
            this.comments[comIndex].commentLikes = this.comments[comIndex].commentLikes + 1;
            this.cd.detectChanges();
            return;
          }else{
            // doc exist means user already liked. So proceed to unlike.
            const batch = this.db.firestore.batch();
            batch.delete(comLikesRef);

            const commRef = this.db.collection("comments").doc(this.commentDocUid).collection("comments").doc(commId).ref;
            batch.update(commRef, {
              commentLikes : firebase.firestore.FieldValue.increment(-1)
            })
            batch.commit()
            .then(sucess =>{
              this.cd.detectChanges();
            })
            .catch(err=>{
              this.dataService.showError('Somwthing went wrong while unliking a comment:(')
              // revert the local changes which were done at the begining of this function as there is error.
              this.comments[comIndex].userLiked = true;
              this.comments[comIndex].commentLikes = this.comments[comIndex].commentLikes + 1;
              this.cd.detectChanges();
            })
          }
        })
    
      }




}