import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicateUserComponent } from './communicate-user.component';

describe('CommunicateUserComponent', () => {
  let component: CommunicateUserComponent;
  let fixture: ComponentFixture<CommunicateUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommunicateUserComponent]
    });
    fixture = TestBed.createComponent(CommunicateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
