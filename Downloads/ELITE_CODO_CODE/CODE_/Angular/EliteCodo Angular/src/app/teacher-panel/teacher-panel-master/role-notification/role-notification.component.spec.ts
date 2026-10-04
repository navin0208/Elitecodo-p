import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleNotificationComponent } from './role-notification.component';

describe('RoleNotificationComponent', () => {
  let component: RoleNotificationComponent;
  let fixture: ComponentFixture<RoleNotificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoleNotificationComponent]
    });
    fixture = TestBed.createComponent(RoleNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
