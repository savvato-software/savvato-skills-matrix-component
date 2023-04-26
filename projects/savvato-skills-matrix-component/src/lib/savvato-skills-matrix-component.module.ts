import { NgModule } from '@angular/core';
import { CommonModule, NgStyle  } from '@angular/common';
import { SavvatoSkillsMatrixComponentComponent } from './savvato-skills-matrix-component.component';

@NgModule({
  declarations: [
    SavvatoSkillsMatrixComponentComponent
  ],
  imports: [
    CommonModule,
    NgStyle
  ],
  exports: [
    SavvatoSkillsMatrixComponentComponent
  ]
})
export class SavvatoSkillsMatrixComponentModule { }
