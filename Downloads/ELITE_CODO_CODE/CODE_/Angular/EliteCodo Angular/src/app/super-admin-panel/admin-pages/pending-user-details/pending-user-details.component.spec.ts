import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingUserDetailsComponent } from './pending-user-details.component';

describe('PendingUserDetailsComponent', () => {
  let component: PendingUserDetailsComponent;
  let fixture: ComponentFixture<PendingUserDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PendingUserDetailsComponent]
    });
    fixture = TestBed.createComponent(PendingUserDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
