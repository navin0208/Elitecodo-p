import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionStatusComponent } from './question-status.component';

describe('QuestionStatusComponent', () => {
  let component: QuestionStatusComponent;
  let fixture: ComponentFixture<QuestionStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionStatusComponent]
    });
    fixture = TestBed.createComponent(QuestionStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
