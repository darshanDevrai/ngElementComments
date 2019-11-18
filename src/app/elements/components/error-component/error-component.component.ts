import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Subscription, Observable, timer} from 'rxjs';

@Component({
  selector: 'app-error-component',
  templateUrl: './error-component.component.html',
  styleUrls: ['./error-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorComponentComponent implements OnInit,OnDestroy {
  private timerSubscription: Subscription;
  private timer: Observable<number>;
  @Input() errorMsg: string ;
  @Input() time: number ;
  @Output() closeError: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.timer        = timer(1000 * this.time); // 5000 millisecond means 5 seconds
    this.timerSubscription = this.timer.subscribe(() => {
        this.onClose();
    });
  }
  onClose() {
    this.closeError.emit(true);
  }

  ngOnDestroy() {
    if ( this.timerSubscription && this.timerSubscription instanceof Subscription) {
      this.timerSubscription.unsubscribe();
    }
  }

}
