import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentPanelComponent } from './parent-panel.component';

describe('ParentPanelComponent', () => {
  let component: ParentPanelComponent;
  let fixture: ComponentFixture<ParentPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ParentPanelComponent]
    });
    fixture = TestBed.createComponent(ParentPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
