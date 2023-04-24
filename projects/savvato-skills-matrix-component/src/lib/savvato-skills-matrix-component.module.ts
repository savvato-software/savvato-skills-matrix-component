import { NgModule } from '@angular/core';
import { CommonModule, NgStyle  } from '@angular/common';
import { SavvatoSkillsMatrixComponentComponent } from './savvato-skills-matrix-component.component';
import { SavvatoSkillsMatrixComponentService } from "./savvato-skills-matrix-component.service";

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
  ],
  providers: [
    SavvatoSkillsMatrixComponentService
  ]
})
export class SavvatoSkillsMatrixComponentModule { }
