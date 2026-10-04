import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundThemeComponent } from './background-theme.component';

describe('BackgroundThemeComponent', () => {
  let component: BackgroundThemeComponent;
  let fixture: ComponentFixture<BackgroundThemeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BackgroundThemeComponent]
    });
    fixture = TestBed.createComponent(BackgroundThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
