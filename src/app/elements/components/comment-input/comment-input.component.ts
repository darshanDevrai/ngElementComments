import { Component, OnInit, Input, ElementRef, ViewChild, Renderer2, Output, EventEmitter, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-comment-input',
  templateUrl: './comment-input.component.html',
  styleUrls: ['./comment-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentInputComponent implements OnInit {


  constructor(private cd: ChangeDetectorRef) { }

  @Input() initData:string;
  @Input() placeholder: string = 'Join the discussion…';
  @Output() comValueChange = new EventEmitter<string>();
  @Output() repValueChange = new EventEmitter<string>();
  @Output() repToRepValueChange = new EventEmitter<string>();
  @Output() inRepValueChange = new EventEmitter<string>();
  @Output() inputFocused = new EventEmitter<boolean>();
  whatOut: EventEmitter<string>;

  content:string;


  @ViewChild('myTextArea', { read: ElementRef, static: true })
  public myTextArea: ElementRef;

  isFocus:boolean = false;
  /*
    values := 
    'com' for comment
    'rep' for reply
    'inRep' for inner reply
  */
  @Input() isFor:string = 'com';

  ngOnInit() {


    if(this.initData){
      this.content = this.initData;
    }

    if(this.isFor === 'com'){
      this.whatOut = this.comValueChange;
    }else if(this.isFor === 'rep'){
      this.whatOut = this.repValueChange;
    }else if(this.isFor === 'repToRep'){
      this.whatOut = this.repToRepValueChange;
    }else if(this.isFor === 'inRep'){
      this.whatOut = this.inRepValueChange;
    }

  }

  focused(){
    this.isFocus = true;
    this.inputFocused.emit(true);
    this.cd.detectChanges();
  }

  blured(){
    this.isFocus = false;
    this.cd.detectChanges();
  }


  // Main function where content changes are captured from textarea.
  public onTextareaChange(newContent: string): void {

    this.whatOut.emit(newContent);
    this.cd.detectChanges();
  }
  

  clearTheTextField(){
    this.myTextArea.nativeElement.value = "";
  }

}
