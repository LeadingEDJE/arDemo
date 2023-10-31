import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArViewComponent } from './ar-view.component';

describe('ArViewComponent', () => {
  let component: ArViewComponent;
  let fixture: ComponentFixture<ArViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArViewComponent]
    });
    fixture = TestBed.createComponent(ArViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
