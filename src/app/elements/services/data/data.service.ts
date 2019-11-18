import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CommentModel } from '../../models/comment.model';
import { replyData } from '../../models/replyData.model';

@Injectable({
  providedIn: 'root'
})


export class DataService {
  

  addComment$ = new Subject<CommentModel>();
  addReply$ = new Subject<replyData>();

  addReplyToReply$ = new Subject<replyData>();

  showErr$ = new Subject<any>();

  constructor() { }

  addCommentToArray(comment:CommentModel){
    this.addComment$.next(comment);
  }

  addReplyToArray(reply:replyData){
    this.addReply$.next(reply);
  }
  addReplyToReplyArray(reply:replyData){
    this.addReplyToReply$.next(reply);
  }

  showError(errMsg){
    this.showErr$.next(errMsg);
  }

}
