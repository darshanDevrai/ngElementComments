import { ReplyModel } from './reply.model';
import * as firebase from 'firebase/app';

export interface CommentModel {
    authorId: string,
    author: string,
    authorPhotoURL : string,
    commentBodyHtml : string,
    commentBodyText : string,
    commentLikes : number,
    noOfReplies : number,
    docId: string,
    timeStamp?: firebase.firestore.FieldValue | number,
    updatedAt?: firebase.firestore.FieldValue | number,
    userLiked?:boolean,
    localTime?:number,
    replies?: ReplyModel[],

}