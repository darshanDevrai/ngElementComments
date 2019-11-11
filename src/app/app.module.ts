import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';

import { createCustomElement } from '@angular/elements';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
// import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import {AngularFireAuthModule} from '@angular/fire/auth';
// import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireFunctionsModule } from '@angular/fire/functions';

import { MainComponent } from './elements/components/main/main.component';
import { AuthComponent } from './elements/components/auth/auth.component';
import { CommentInputComponent } from './elements/components/comment-input/comment-input.component';
import { CommentsListComponent } from './elements/components/comments-list/comments-list.component';
import { AddCommentComponent } from './elements/components/add-comment/add-comment.component';
import { TimeAgoPipe } from './elements/pipes/time-ago/time-ago.pipe';
import { RepliesListComponent } from './elements/components/replies-list/replies-list.component';
import { RepliesToReplyListComponent } from './elements/components/replies-to-reply-list/replies-to-reply-list.component';
import { ErrorComponentComponent } from './elements/components/error-component/error-component.component';

@NgModule({
  declarations: [
    
  MainComponent,
    
  AuthComponent,
    
  CommentInputComponent,
    
  CommentsListComponent,
    
  AddCommentComponent,
    
  TimeAgoPipe,
    
  RepliesListComponent,
    
  RepliesToReplyListComponent,
    
  ErrorComponentComponent,
    
    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    // FlexLayoutModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireFunctionsModule,
    AngularFirestoreModule,
    AngularFireAuthModule
  ],
  providers: [],
  entryComponents:[MainComponent, AuthComponent],
  // bootstrap: []
})
export class AppModule { 
  constructor(private injector:Injector){
  }
  ngDoBootstrap(){
    const elements: any[] = [
      [MainComponent, 'ng-element-commnets'],
    ];
    for(const [component, name] of elements){
      const el = createCustomElement(component, {injector:this.injector});
      customElements.define(name, el);
    }
  }
}
