import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearOfAppearanceManagementComponent } from './year-of-appearance-management.component';

describe('YearOfAppearanceManagementComponent', () => {
  let component: YearOfAppearanceManagementComponent;
  let fixture: ComponentFixture<YearOfAppearanceManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [YearOfAppearanceManagementComponent]
    });
    fixture = TestBed.createComponent(YearOfAppearanceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
