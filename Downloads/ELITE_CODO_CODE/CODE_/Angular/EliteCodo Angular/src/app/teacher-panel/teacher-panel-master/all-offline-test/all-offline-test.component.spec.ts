import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllOfflineTestComponent } from './all-offline-test.component';

describe('AllOfflineTestComponent', () => {
  let component: AllOfflineTestComponent;
  let fixture: ComponentFixture<AllOfflineTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllOfflineTestComponent]
    });
    fixture = TestBed.createComponent(AllOfflineTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
