import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingUserStatusComponent } from './pending-user-status.component';

describe('PendingUserStatusComponent', () => {
  let component: PendingUserStatusComponent;
  let fixture: ComponentFixture<PendingUserStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PendingUserStatusComponent]
    });
    fixture = TestBed.createComponent(PendingUserStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
