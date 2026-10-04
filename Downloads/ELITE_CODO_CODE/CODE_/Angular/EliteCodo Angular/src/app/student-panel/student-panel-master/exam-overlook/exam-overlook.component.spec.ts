import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamOverlookComponent } from './exam-overlook.component';

describe('ExamOverlookComponent', () => {
  let component: ExamOverlookComponent;
  let fixture: ComponentFixture<ExamOverlookComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExamOverlookComponent]
    });
    fixture = TestBed.createComponent(ExamOverlookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
