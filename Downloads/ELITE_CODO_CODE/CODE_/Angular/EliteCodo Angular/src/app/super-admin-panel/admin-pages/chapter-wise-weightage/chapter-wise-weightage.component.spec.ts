import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChapterWiseWeightageComponent } from './chapter-wise-weightage.component';

describe('ChapterWiseWeightageComponent', () => {
  let component: ChapterWiseWeightageComponent;
  let fixture: ComponentFixture<ChapterWiseWeightageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChapterWiseWeightageComponent]
    });
    fixture = TestBed.createComponent(ChapterWiseWeightageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
