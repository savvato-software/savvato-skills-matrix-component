import { TestBed } from '@angular/core/testing';

import { SavvatoSkillsMatrixComponentService } from './savvato-skills-matrix-component.service';

describe('SavvatoSkillsMatrixComponentService', () => {
  let service: SavvatoSkillsMatrixComponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SavvatoSkillsMatrixComponentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
