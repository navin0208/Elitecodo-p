import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportantQuestionsComponent } from './important-questions.component';

describe('ImportantQuestionsComponent', () => {
  let component: ImportantQuestionsComponent;
  let fixture: ComponentFixture<ImportantQuestionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImportantQuestionsComponent]
    });
    fixture = TestBed.createComponent(ImportantQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
