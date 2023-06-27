import { NgModule } from '@angular/core';
import { CommonModule, NgStyle  } from '@angular/common';
import { SavvatoSkillsMatrixComponentComponent } from './savvato-skills-matrix-component.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkMenuModule } from '@angular/cdk/menu';

@NgModule({
  declarations: [
    SavvatoSkillsMatrixComponentComponent
  ],
  imports: [
    CommonModule,
    NgStyle,
    OverlayModule,
    CdkMenuModule
  ],
  exports: [
    SavvatoSkillsMatrixComponentComponent
  ]
})
export class SavvatoSkillsMatrixComponentModule { }
