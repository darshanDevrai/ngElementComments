import * as firebase from 'firebase/app';
export interface ReplyModel {
    authorId: string,
    author: string,
    authorPhotoURL : string,
    replyTo: string,
    replyBodyHtml : string,
    replyBodyText : string,
    replyLikes : number,
    docId: string,
    noOfReplies? : number,
    commentId?:string,
    replyId?:string,
    timeStamp?: firebase.firestore.FieldValue | number,
    updatedAt?: firebase.firestore.FieldValue | number,
    userLiked?:boolean,
    localTime?:number

}