import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArCanvasComponent } from './ar-canvas.component';

describe('ArCanvasComponent', () => {
  let component: ArCanvasComponent;
  let fixture: ComponentFixture<ArCanvasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArCanvasComponent],
    });
    fixture = TestBed.createComponent(ArCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
