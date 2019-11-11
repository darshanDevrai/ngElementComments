import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommentModel } from '../../models/comment.model';
import { replyData } from '../../models/replyData.model';

@Injectable({
  providedIn: 'root'
})


export class DataService {
  

  addComment$ = new BehaviorSubject<CommentModel>(
    null
  );
  addReply$ = new BehaviorSubject<replyData>(
    null
  );

  addReplyToReply$ = new BehaviorSubject<replyData>(
    null
  );

  showErr$ = new BehaviorSubject<any>(
    null
  );

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
