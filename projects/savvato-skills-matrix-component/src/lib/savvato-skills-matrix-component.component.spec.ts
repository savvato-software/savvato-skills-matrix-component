import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavvatoSkillsMatrixComponentComponent } from './savvato-skills-matrix-component.component';

describe('SavvatoSkillsMatrixComponentComponent', () => {
  let component: SavvatoSkillsMatrixComponentComponent;
  let fixture: ComponentFixture<SavvatoSkillsMatrixComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SavvatoSkillsMatrixComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavvatoSkillsMatrixComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
