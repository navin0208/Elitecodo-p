import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllAcceptedQuestionsComponent } from './all-accepted-questions.component';

describe('AllAcceptedQuestionsComponent', () => {
  let component: AllAcceptedQuestionsComponent;
  let fixture: ComponentFixture<AllAcceptedQuestionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllAcceptedQuestionsComponent]
    });
    fixture = TestBed.createComponent(AllAcceptedQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
