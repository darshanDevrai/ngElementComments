import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepliesToReplyListComponent } from './replies-to-reply-list.component';

describe('RepliesToReplyListComponent', () => {
  let component: RepliesToReplyListComponent;
  let fixture: ComponentFixture<RepliesToReplyListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepliesToReplyListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepliesToReplyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
