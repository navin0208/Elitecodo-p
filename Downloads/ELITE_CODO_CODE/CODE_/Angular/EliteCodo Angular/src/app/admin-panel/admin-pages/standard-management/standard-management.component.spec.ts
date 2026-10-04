import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardManagementComponent } from './standard-management.component';

describe('StandardManagementComponent', () => {
  let component: StandardManagementComponent;
  let fixture: ComponentFixture<StandardManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StandardManagementComponent]
    });
    fixture = TestBed.createComponent(StandardManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
