import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstituteLayoutComponent } from './institute-layout.component';

describe('InstituteLayoutComponent', () => {
  let component: InstituteLayoutComponent;
  let fixture: ComponentFixture<InstituteLayoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InstituteLayoutComponent]
    });
    fixture = TestBed.createComponent(InstituteLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
