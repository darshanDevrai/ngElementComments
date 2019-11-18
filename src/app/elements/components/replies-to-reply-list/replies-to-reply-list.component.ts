import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { ReplyModel } from '../../models/reply.model';
import { noOfRepliesData } from '../../models/noOfRepliesData.model';
import * as firebase from 'firebase/app';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth/auth.service';
import { DataService } from '../../services/data/data.service';
import { LinkifyService } from '../../services/linkify/linkify.service';

@Component({
  selector: 'app-replies-to-reply-list',
  templateUrl: './replies-to-reply-list.component.html',
  styleUrls: ['./replies-to-reply-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepliesToReplyListComponent implements OnInit,OnDestroy {


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

  @Input()
  commentDocUid:string;

  @Input()
  commentId:string;

  @Input()
  replyId:string;

  @Input()
  replyIndex:number;

  // This variable holds last doc from firestore query which then used in 'startAfter()'
  lastReplyDoc: any;

  // flag to uniquely identify which reply is being edited. 
  editReplyFlag: boolean[] = [];

  // flag to uniquely identify which reply is being deleted. 
  deletingFlag: boolean[] = [];


  // flag to show load more button or not
  loadMoreReplies:boolean | string = false;

  // disable add reply button
  disableUpdateReplyButton: boolean = false;
  disableInnerReplyButton:boolean = false;

  // Same thing for updating reply.
  updateReplyBody: string = ''; 

  innerReplyBody:string = '';

    /* 
  This is used to toggle inner reply buttons with one button passes docId, while other button 
  passes 'false' to toggle it. Then this uid is used to uniquely identify reply whoes inner reply
  button is clicked and shows only 'add reply' section for that comment. Only one comment's 
  'add reply' section is visible at a time.
  */
  innerReplyUid:any = false;


  constructor(
    private db: AngularFirestore,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private dataService:DataService,
    private linkifyService:LinkifyService
  ) {
      this.authSubscription = this.authService.user$.subscribe((user)=>{
        this._user = user;
        this.cd.detectChanges();
      });
   }

  ngOnInit() {
    this.getReplies();
    this.dataSubscription = this.dataService.addReplyToReply$.subscribe((replyData)=>{
      if(replyData != null && this.replyId == replyData.replyId){
        this.noOfReplies = this.noOfReplies + 1;
        const noOfRepliesData: noOfRepliesData = {
          noOfReplies :this.noOfReplies, replyIndex: this.replyIndex
        };
        this.noOfRepliesForReplyChanged.emit(noOfRepliesData);
        this.replies.unshift(replyData.reply);
        this.cd.detectChanges();
      }
    });
  }

  getReplies(){

    const replyDoc: AngularFirestoreCollection =  this.db.collection("comments").doc(this.commentDocUid).collection("comments")
      .doc(this.commentId).collection("replies").doc(this.replyId).collection("replies");
      replyDoc.ref.orderBy('timeStamp').limit(10)
          .get().then(querySnapshot => {
            if(!querySnapshot.empty ){
              this.lastReplyDoc = querySnapshot.docs[querySnapshot.docs.length-1];
              var repliesLength;
              querySnapshot.forEach( doc => {
                var data = doc.data() as ReplyModel;
              
                repliesLength = this.replies.push(data);
    
                this.checkUserLikedReply( data.docId, repliesLength - 1);
              })

              if(this.noOfReplies > repliesLength){
                this.loadMoreReplies = true;
              }
            }
            
            this.cd.detectChanges();
          }).catch(err=>{
            this.dataService.showError('Something went wrong while getting replies:(');

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
      .doc(this.commentId).collection("replies").doc(this.replyId).collection("replies").ref;

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
          this.dataService.showError('Something went wrong while fetching more replies:(');
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

  repToRepValueChange(replyBody){
    // console.log("reply body in comments is ", replyBody);
    this.updateReplyBody = replyBody;
  }


  updateReply(replyIndex){
    // use reply body only
    if(this.updateReplyBody.length < 1 || this.updateReplyBody == ''){
      this.dataService.showError('Reply body is empty:(');
      return;
    }else{
      this.disableUpdateReplyButton = true;
      this.cd.detectChanges();
      const linkifyedReplyBody = this.linkifyService.linkifyIt(this.updateReplyBody);
      // sanitize html
      const replyDocId = this.replies[replyIndex].docId;
      const replyDocRef = this.db.collection("comments").doc(this.commentDocUid).collection("comments").doc(this.commentId)
        .collection("replies").doc(this.replyId).collection("replies").doc(replyDocId).ref;

      replyDocRef
          .update({
            replyBodyHtml : linkifyedReplyBody.html,  
            replyBodyText : linkifyedReplyBody.text, 
            updatedAt : firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {

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
          this.dataService.showError('Something went wrong while updating the reply:(')
          this.disableUpdateReplyButton = false;
          this.cd.detectChanges();
      });
    }
    
  }


  deleteReply(replyIndex){
    this.deletingFlag[replyIndex] = true;
    this.cd.detectChanges();
    const replyDocId = this.replies[replyIndex].docId;
    const batch = this.db.firestore.batch();

    const replyDocRef = this.db.collection("comments").doc(this.commentDocUid).collection("comments").doc(this.commentId)
        .collection("replies").doc(this.replyId).collection("replies").doc(replyDocId).ref;

    const parentReplyDocRed = this.db.collection("comments").doc(this.commentDocUid).collection("comments").doc(this.commentId)
    .collection("replies").doc(this.replyId).ref;

    batch.update(parentReplyDocRed,{
      noOfReplies : firebase.firestore.FieldValue.increment(-1)
    });

    batch.delete(replyDocRef);

      batch.commit().then(value=>{
        this.replies.splice(replyIndex,1);
        this.noOfReplies = this.noOfReplies - 1;
        this.noOfRepliesForReplyChanged.emit({noOfReplies:this.noOfReplies,replyIndex:this.replyIndex});
        this.deletingFlag = [];
        this.cd.detectChanges();
      }).catch(err=>{
        // console.log("Error while deleting comment -->", err);
        this.dataService.showError('Something went wrong while deleting the reply:(');
        this.deletingFlag = [];
        this.cd.detectChanges();
      })


  }

  innerReplyClicked(docId){
    if( !this._user){
      return this.authService.googleSignin();
    }
    if(docId != false){
      this.innerReplyUid = docId;
      this.innerReplyBody = "";
    }else{
      this.innerReplyUid = docId;
      this.innerReplyBody = "";
    }
    this.cd.detectChanges();
    
  }

  cancelInnerReply(){
    this.innerReplyUid = false;
    this.innerReplyBody = "";
    this.cd.detectChanges();
  }

  inRepValueChange(innerReplyBody){
    // console.log("Inner reply body in comments is ", innReplyBody);
    this.innerReplyBody = innerReplyBody;
  }

  addReplyToReplyBody(replyIndex){
    if( !this._user){
      return this.authService.googleSignin();
    }
    if(this.innerReplyBody.length == 0  || this.innerReplyBody == ''){
      this.dataService.showError('Reply body is empty:(');
      return;
    }else{
      // console.log("adding reply to reply");
      this.disableInnerReplyButton = true;
      this.cd.detectChanges();
      const linkifyedReplyBody = this.linkifyService.linkifyIt(this.innerReplyBody);
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

      const  replyDocRef = this.db.collection("comments").doc(this.commentDocUid)
        .collection("comments").doc(this.commentId)
        .collection("replies").doc(this.replyId)
        .collection("replies").doc(docId).ref;
        
        batch.set(replyDocRef, docToAdd);
        const commentDocRef = this.db.collection("comments").doc(this.commentDocUid)
                            .collection("comments").doc(this.commentId)
                            .collection("replies").doc(this.replyId).ref;
        batch.update(commentDocRef, {
          noOfReplies : firebase.firestore.FieldValue.increment(1)
        });

     
      batch.commit()
      .then((docRef) => {
            // console.log("Document written with ID: ", docRef.id);
            // add new commnet in local array
            const date = new Date(); 
            docToAdd.localTime = date.getTime();// local time
            this.noOfReplies = this.noOfReplies + 1;
              this.replies.push(docToAdd);
              this.noOfRepliesForReplyChanged.emit({replyIndex: this.replyIndex, noOfReplies: this.noOfReplies});
            
            this.innerReplyUid = false;
            this.innerReplyBody = "";
            this.disableInnerReplyButton = false;
            this.cd.detectChanges();
      })
      .catch((error) =>{
          this.dataService.showError('Something went wrong while adding the reply:(');
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
          .collection("replies").doc(this.replyId)
          .collection("replies").doc(replyId).ref;
          batch.update(replyRef,{
            replyLikes : firebase.firestore.FieldValue.increment(1)
          });

        batch.commit()
        .then(sucess =>{
          this.cd.detectChanges();
        })
        .catch(err=>{
          // console.error("Error in likeReplyClicked add",err);
          this.dataService.showError('Something went wrong while liking the reply:(');
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
    var commLikeDocId = "user::"+userId+"-"+replyId;
    // var comLikesRef = this.db.collection("commentLikes").doc(commLikeDocId).ref;
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
                            .collection("replies").doc(this.replyId)
                            .collection("replies").doc(replyId).ref;

        batch.update(replyRef,{
          replyLikes : firebase.firestore.FieldValue.increment(-1)
        });
        batch.commit()
        .then(sucess =>{
          this.cd.detectChanges();
        })
        .catch(err=>{
          // console.error("Error in unLikeReplyClicked add",err);
          this.dataService.showError('Something went wrong while unliking the reply:(');
          this.replies[replyIndex].userLiked = true;
          this.replies[replyIndex].replyLikes = this.replies[replyIndex].replyLikes + 1;
          this.cd.detectChanges();
        });
      }
    })
  }






}
