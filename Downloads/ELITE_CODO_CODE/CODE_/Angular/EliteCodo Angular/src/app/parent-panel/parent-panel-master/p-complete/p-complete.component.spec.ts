import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PCompleteComponent } from './p-complete.component';

describe('PCompleteComponent', () => {
  let component: PCompleteComponent;
  let fixture: ComponentFixture<PCompleteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PCompleteComponent]
    });
    fixture = TestBed.createComponent(PCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
