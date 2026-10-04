import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstitutionManagementComponent } from './institution-management.component';

describe('InstitutionManagementComponent', () => {
  let component: InstitutionManagementComponent;
  let fixture: ComponentFixture<InstitutionManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InstitutionManagementComponent]
    });
    fixture = TestBed.createComponent(InstitutionManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
