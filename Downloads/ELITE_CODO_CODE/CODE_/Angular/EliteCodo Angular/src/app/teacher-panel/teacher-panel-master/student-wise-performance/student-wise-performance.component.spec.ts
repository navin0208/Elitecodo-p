import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentWisePerformanceComponent } from './student-wise-performance.component';

describe('StudentWisePerformanceComponent', () => {
  let component: StudentWisePerformanceComponent;
  let fixture: ComponentFixture<StudentWisePerformanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentWisePerformanceComponent]
    });
    fixture = TestBed.createComponent(StudentWisePerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
