import { Component, OnInit, ChangeDetectorRef, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ReplyModel } from '../../models/reply.model';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth/auth.service';
import { DataService } from '../../services/data/data.service';
import * as firebase from 'firebase/app';
import { LinkifyService } from '../../services/linkify/linkify.service';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { replyData } from '../../models/replyData.model';
import { noOfRepliesData } from '../../models/noOfRepliesData.model';
import { AngularFireFunctions } from '@angular/fire/functions';

@Component({
  selector: 'app-replies-list',
  templateUrl: './replies-list.component.html',
  styleUrls: ['./replies-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepliesListComponent implements OnInit,OnDestroy {

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

  _user:User;

  // Array holding replies
  replies: Array<ReplyModel> = [];

  @Input()
  noOfReplies:number = 0;

  @Output() noOfRepliesForReplyChanged = new EventEmitter<noOfRepliesData>();

  @Output() noOfRepliesChanged = new EventEmitter<noOfRepliesData>();

  @Input()
  commentDocUid:string;

  @Input()
  commentId:string;

  @Input()
  commentIndex:number;


  // This variable holds last doc from firestore query which then used in 'startAfter()'
  lastReplyDoc: any;

  // flag to show load more button or not
  loadMoreReplies:boolean | string = false;

  // flag to uniquely identify which reply is being edited. 
  editReplyFlag: boolean[] = [];

  // flag to uniquely identify which reply is being deleted. 
  deletingFlag: boolean[] = [];

  // disable add reply button
  disableUpdateReplyButton: boolean = false;
  disableReplyToReplyButton:boolean = false;

  // Same thing for updating reply.
  updateReplyBody: string = ''; 

  // innerReplyBody:any = '';
  replyToReplyBody:string = '';

    /* 
  This is used to toggle inner reply buttons with one button passes docId, while other button 
  passes 'false' to toggle it. Then this uid is used to uniquely identify reply whoes inner reply
  button is clicked and shows only 'add reply' section for that comment. Only one comment's 
  'add reply' section is visible at a time.
  */
  // innerReplyUid:any = false;
  replyToReplyUid:any = false;

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

    this.getReplies();
      this.dataSubscription = this.dataService.addReply$.subscribe((replyData)=>{
        if(replyData != null && this.commentId == replyData.commentId){
          this.noOfReplies = this.noOfReplies + 1;
          const noOfRepliesData: noOfRepliesData = {
            noOfReplies :this.noOfReplies, commentIndex: this.commentIndex
          };
          this.noOfRepliesChanged.emit(noOfRepliesData);
          this.replies.unshift(replyData.reply);
          this.cd.detectChanges();
        }
        
      });

    

  }

  noOfRepliesForReplyChangedEvent(noOfRepliesDoc){
    const index = noOfRepliesDoc.replyIndex;
    this.replies[index].noOfReplies = noOfRepliesDoc.noOfReplies;
    this.cd.detectChanges();
  }

  getReplies(){

    const replyDoc: AngularFirestoreCollection = this.db.collection("comments").doc(this.commentDocUid)
      .collection("comments")
      .doc(this.commentId).collection("replies");

      replyDoc.ref.orderBy('timeStamp').limit(10)
          .get().then(querySnapshot => {
            if(!querySnapshot.empty ){
              this.lastReplyDoc = querySnapshot.docs[querySnapshot.docs.length-1];
              let repliesLength;
              querySnapshot.forEach( doc => {
                const data = doc.data() as ReplyModel;
                repliesLength = this.replies.push(data);
    
                this.checkUserLikedReply( data.docId, repliesLength - 1);
              })

              if(this.noOfReplies > repliesLength){
                this.loadMoreReplies = true;
              }
            }
            
            this.cd.detectChanges();
          }).catch(err=>{
            this.dataService.showError('Error gettting replies');
          });

    
    
  }

  checkUserLikedReply(replyId:string, index:number){
    if(this._user){
      const commLikeDocId = "user::"+this._user.uid+"-"+replyId;
      this.db.collection("comments").doc(this.commentDocUid).
                      collection("commentLikes").doc(commLikeDocId).get()
      .toPromise()
      .then(docSnapshot =>{
        if(docSnapshot.exists){
          this.replies[index].userLiked = true;
        }else{
          this.replies[index].userLiked = false;
        }
        this.cd.detectChanges();
        return;
      });
    }else{
      return;
    }
   
  }

  showMoreReplies(){
    this.loadMoreReplies = 'loading';
    this.cd.detectChanges();
    const replyRef = this.db.collection("comments").doc(this.commentDocUid).collection("comments")
      .doc(this.commentId).collection("replies").ref;

    replyRef.orderBy('timeStamp', 'asc').startAfter(this.lastReplyDoc).limit(10)
        .get().then(querySnapshot => {
          this.lastReplyDoc = querySnapshot.docs[querySnapshot.docs.length-1];
          let repliesLength;
          querySnapshot.forEach( doc => {
            
            const data = doc.data() as ReplyModel;
    
            repliesLength = this.replies.push(data);

            this.checkUserLikedReply( data.docId, repliesLength - 1);
          })
          
          
          if(this.noOfReplies > repliesLength){
            this.loadMoreReplies = true;
          }else{
            this.loadMoreReplies = false;
          }
          this.cd.detectChanges();
        }).catch((err)=>{
          this.loadMoreReplies = true;
          this.cd.detectChanges();
          this.dataService.showError("Something went wrong while fetching more replies:(");
        });
  }

    // set editFalg to true;
    editReply(replyIndex){
      this.editReplyFlag = [];
      this.editReplyFlag[replyIndex] = true;
      this.updateReplyBody = this.replies[replyIndex].replyBodyText;
      this.cd.detectChanges();
    }
  
    // set editFalg to true;
    cancelUpdateReply(replyIndex){
      this.editReplyFlag = [];
      this.updateReplyBody = '';
      this.cd.detectChanges();
    }

    repValueChange(replyBody){
      // console.log("reply body in comments is ", replyBody);
      this.updateReplyBody = replyBody;
    }

     // Update reply
  updateReply(replyIndex){
    // use reply body only
    if(this.updateReplyBody.length < 1 || this.updateReplyBody == ''){
      this.dataService.showError('Reply body is empty:(');
      return;
    }else{
      this.disableUpdateReplyButton = true;
      this.cd.detectChanges();
      const linkifyedReplyBody = this.linkifyService.linkifyIt(this.updateReplyBody);
      const replyDocId = this.replies[replyIndex].docId;
      const replyDocRef = this.db.collection("comments").doc(this.commentDocUid).collection("comments").doc(this.commentId)
        .collection("replies").doc(replyDocId).ref;

      
      replyDocRef
          .update({
            replyBodyHtml : linkifyedReplyBody.html,  
            replyBodyText : linkifyedReplyBody.text, 
            updatedAt : firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
          // console.log("Document successfully updated!");
          this.replies[replyIndex].replyBodyHtml = linkifyedReplyBody.html;
          this.replies[replyIndex].replyBodyText = linkifyedReplyBody.text;
          this.disableUpdateReplyButton = false;
          this.updateReplyBody = '';
          this.replies[replyIndex].updatedAt = 1;
          this.editReplyFlag[replyIndex] = false;
          this.cd.detectChanges();
      })
      .catch((error) => {
          // The document probably doesn't exist.
          this.dataService.showError('Something went wrong while updating the reply:( Please try again');
          this.disableUpdateReplyButton = false;
          this.cd.detectChanges();
      });
    }
    
  }

  deleteReply( replyIndex){
    this.deletingFlag[replyIndex] = true;
    this.cd.detectChanges();
    const replyDocId = this.replies[replyIndex].docId;
    const noOfReplies = this.replies[replyIndex].noOfReplies;
    const batch = this.db.firestore.batch();
    const parentReplyDocRed = this.db.collection("comments").doc(this.commentDocUid).collection("comments")
    .doc(this.commentId).ref;
    batch.update(parentReplyDocRed,{
      noOfReplies : firebase.firestore.FieldValue.increment(-1)
    });

    if(noOfReplies == 0){
      const replyDocRef =  this.db.collection("comments").doc(this.commentDocUid)
        .collection("comments").doc(this.commentId)
        .collection("replies").doc(replyDocId).ref;
        batch.delete(replyDocRef);

        batch.commit().then(value=>{
          this.replies.splice(replyIndex,1);
          this.noOfReplies = this.noOfReplies - 1;
          this.noOfRepliesChanged.emit({noOfReplies:this.noOfReplies,commentIndex:this.commentIndex});
          this.deletingFlag = [];
          this.cd.detectChanges();
        }).catch(err=>{
          this.dataService.showError('Something went wrong while deleting the reply');
          this.deletingFlag = [];
          this.cd.detectChanges();
        })
    }else{
      const deleteFStoreDoc = this.fns.httpsCallable('deleteFStoreDoc');
      const deleteDoc = deleteFStoreDoc({
        path: `/comments/${this.commentDocUid}/comments/${this.commentId}/replies/${replyDocId}` 
       }).toPromise();

      deleteDoc.then(value => {
        // here decrement parents number of comments.
        batch.commit().then(value=>{
          this.replies.splice(replyIndex,1);
          this.noOfReplies = this.noOfReplies - 1;
          this.noOfRepliesChanged.emit({noOfReplies:this.noOfReplies,commentIndex:this.commentIndex});
          this.deletingFlag = [];
          this.cd.detectChanges();
        }).catch(err=>{
          this.dataService.showError("Something went wrong while deleting the reply:(");
          this.deletingFlag = [];
          this.cd.detectChanges();
        });
      }).catch(err=>{
        this.dataService.showError("Something went wrong while deleting the reply:(");
        this.deletingFlag = [];
        this.cd.detectChanges();
      })

    }

  }

  replyToReplyClicked(docId){
    if( !this._user){
      return this.authService.googleSignin();
    }
    if(docId != false){
      this.replyToReplyUid = docId;
      this.replyToReplyBody = "";
    }else{
      this.replyToReplyUid = docId;
      this.replyToReplyBody = "";
    }
    this.cd.detectChanges();
    
  }

  cancelReplyToReply(){
    this.replyToReplyUid = false;
    this.replyToReplyBody = "";
    this.cd.detectChanges();
  }

  repToRepValueChange(leveleTwoReplyBody){
    this.replyToReplyBody = leveleTwoReplyBody;
  }

  addReplyToReplyBody(replyIndex){
    if( !this._user){
      return this.authService.googleSignin();
    }
    if(this.replyToReplyBody.length == 0  || this.replyToReplyBody == ''){
      this.dataService.showError("REply body is empty:(");
      return;
    }else{

      this.disableReplyToReplyButton = true;
      this.cd.detectChanges();
      const linkifyedReplyBody = this.linkifyService.linkifyIt(this.replyToReplyBody);
      const docId = this.db.createId();
      const replyId = this.replies[replyIndex].docId;
      const replyTo = this.replies[replyIndex].author;
      const docToAdd:ReplyModel = {
        authorId: this._user.uid,
        author: this._user.displayName,
        authorPhotoURL : this._user.photoURL,
        replyTo : replyTo,
        replyBodyText : linkifyedReplyBody.text,
        replyBodyHtml : linkifyedReplyBody.html, 
        replyId : replyId,
        replyLikes : 0,
        noOfReplies : 0,
        docId : docId,
        timeStamp : firebase.firestore.FieldValue.serverTimestamp()
      }

      const batch = this.db.firestore.batch();

      const replyDocRef = this.db.collection("comments").doc(this.commentDocUid)
        .collection("comments").doc(this.commentId)
        .collection("replies").doc(replyId)
        .collection("replies").doc(docId).ref;

      batch.set(replyDocRef, docToAdd);

      const commentDocRef = this.db.collection("comments").doc(this.commentDocUid)
        .collection("comments").doc(this.commentId)
        .collection("replies").doc(replyId).ref;
      batch.update(commentDocRef, {
        noOfReplies : firebase.firestore.FieldValue.increment(1)
      });
      
      batch.commit()
      .then((docRef) => {

            // add new commnet in local array
            const date = new Date(); 
            docToAdd.localTime = date.getTime();// local time

              const replyData:replyData = {
                reply: docToAdd,
                replyId: replyId
              }
              this.dataService.addReplyToReplyArray(replyData);
            
            this.replyToReplyUid = false;
            this.replyToReplyBody = "";
            this.disableReplyToReplyButton = false;
            this.cd.detectChanges();
      })
      .catch((error) =>{

          this.dataService.showError("Something went wrong while adding the reply:(");
          this.noOfReplies = this.noOfReplies - 1;
          this.cd.detectChanges();
      });


    }
  }

  likeReplyClicked(replyIndex){
    if( !this._user){
      return this.authService.googleSignin();
    }
    // change local data first 
    this.replies[replyIndex].userLiked = true;
    this.replies[replyIndex].replyLikes = this.replies[replyIndex].replyLikes + 1;
    this.cd.detectChanges();
    const commId = this.commentId;
    const replyId = this.replies[replyIndex].docId;
    const userId = this._user.uid;
    const commLikeDocId = "user::"+userId+"-"+replyId;
    const comLikesRef = this.db.collection("comments").doc(this.commentDocUid).
      collection("commentLikes").doc(commLikeDocId).ref;
    comLikesRef.get().then((commLikedDoc) =>{
      if (!commLikedDoc.exists) {
        // doc doesnt exist means not already liked. So proceed to like.
        const batch = this.db.firestore.batch();
        batch.set(comLikesRef,{
          commentId : replyId,
          userId : userId
        })

        const replyRef = this.db.collection("comments").doc(this.commentDocUid)
          .collection("comments").doc(commId)
          .collection("replies").doc(replyId).ref;
        batch.update(replyRef,{
          replyLikes : firebase.firestore.FieldValue.increment(1)
        });

        batch.commit()
        .then(sucess =>{
          this.cd.detectChanges();
        })
        .catch(err=>{

          this.dataService.showError("Something went wrong while liking the reply:(");
          this.replies[replyIndex].userLiked = false;
          this.replies[replyIndex].replyLikes = this.replies[replyIndex].replyLikes - 1;
          this.cd.detectChanges();
        });
      }else{
        // revert the local changes which were done at the begining of this function as user 
        // already liked this comment.
        this.replies[replyIndex].replyLikes = this.replies[replyIndex].replyLikes - 1;
        this.cd.detectChanges();
        return;
      }
    })

  }

  unLikeReplyClicked( replyIndex){
    if( !this._user){
      return this.authService.googleSignin();
    }
    this.replies[replyIndex].userLiked = false;
    this.replies[replyIndex].replyLikes = this.replies[replyIndex].replyLikes - 1;
    this.cd.detectChanges();
    const replyId = this.replies[replyIndex].docId;
    const userId = this._user.uid;
    const commLikeDocId = "user::"+userId+"-"+replyId;

    const comLikesRef = this.db.collection("comments").doc(this.commentDocUid).
      collection("commentLikes").doc(commLikeDocId).ref;

    comLikesRef.get().then((commLikedDoc) =>{
      if (!commLikedDoc.exists) {
        // doc doesnt exist means not already liked. So dont proceed to unlike.
        this.replies[replyIndex].userLiked = true;
        this.replies[replyIndex].replyLikes = this.replies[replyIndex].replyLikes + 1;
        this.cd.detectChanges();
        return;
      }else{
         // doc exist means user already liked. So proceed to unlike.
        const batch = this.db.firestore.batch();
        batch.delete(comLikesRef);

        const replyRef = this.db.collection("comments").doc(this.commentDocUid)
                            .collection("comments").doc(this.commentId)
                            .collection("replies").doc(replyId).ref;

        batch.update(replyRef,{
          replyLikes : firebase.firestore.FieldValue.increment(-1)
        });
        batch.commit()
        .then(sucess =>{
          this.cd.detectChanges();
        })
        .catch(err=>{

          this.dataService.showError("Something went wrong while unliking the reply:(");
          this.replies[replyIndex].userLiked = true;
          this.replies[replyIndex].replyLikes = this.replies[replyIndex].replyLikes + 1;
          this.cd.detectChanges();
        });
      }
    })
  }



  


}
