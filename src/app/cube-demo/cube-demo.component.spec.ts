import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CubeDemoComponent } from './cube-demo.component';

describe('CubeDemoComponent', () => {
  let component: CubeDemoComponent;
  let fixture: ComponentFixture<CubeDemoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CubeDemoComponent]
    });
    fixture = TestBed.createComponent(CubeDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
