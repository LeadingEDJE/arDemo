import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineDemoComponent } from './line-demo.component';

describe('LineDemoComponent', () => {
  let component: LineDemoComponent;
  let fixture: ComponentFixture<LineDemoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LineDemoComponent]
    });
    fixture = TestBed.createComponent(LineDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
