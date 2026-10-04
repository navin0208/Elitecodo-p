import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamMarksDistributionComponent } from './exam-marks-distribution.component';

describe('ExamMarksDistributionComponent', () => {
  let component: ExamMarksDistributionComponent;
  let fixture: ComponentFixture<ExamMarksDistributionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExamMarksDistributionComponent]
    });
    fixture = TestBed.createComponent(ExamMarksDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
