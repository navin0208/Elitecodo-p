import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChapterManagementComponent } from './chapter-management.component';

describe('ChapterManagementComponent', () => {
  let component: ChapterManagementComponent;
  let fixture: ComponentFixture<ChapterManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChapterManagementComponent]
    });
    fixture = TestBed.createComponent(ChapterManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
