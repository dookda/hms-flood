import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Acc7dayComponent } from './acc7day.component';

describe('Acc7dayComponent', () => {
  let component: Acc7dayComponent;
  let fixture: ComponentFixture<Acc7dayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Acc7dayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Acc7dayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
