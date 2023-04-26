import { Injectable } from '@angular/core';

import { FunctionPromiseService } from '@savvato-software/savvato-javascript-services'

import { SkillsMatrixAPIService } from '@savvato-software/savvato-skills-matrix-services'

@Injectable({
  providedIn: 'root'
})
export class SavvatoSkillsMatrixComponentService {

  env: any = undefined;

  constructor(protected _skillsMatrixAPI: SkillsMatrixAPIService,
    private _functionPromiseService: FunctionPromiseService) { }

  _init(env: any) {
    let self = this;

    self._skillsMatrixAPI.setEnvironment(env);

    self._functionPromiseService.initFunc("THE-SM", () => {
      return new Promise((resolve, reject) => {
        self._skillsMatrixAPI.get(1).then((tp) => {
          resolve(tp);
        })
      })
    })
  }

  reset() {
    this._functionPromiseService.reset("THE-SM");
  }

  waitingPromise() {
    return this._functionPromiseService.waitAndGet("THE-SM", "THE-SM", { 'freshnessLengthInMillis': 60000 * 10 });
  }

  /** ** */
  /*    dtim-techprofile-component model service methods */
  /** ** */
  getModel() {
    return this._functionPromiseService.get("THE-SM", "THE-SM", { 'freshnessLengthInMillis': 60000 * 10 });
  }

  getName() {
    let model: any = this.getModel();

    if (model)
      return model['name']
    else
      return undefined;
  }

  getTopics() {
    let rtn: any = undefined;

    let model: any = this.getModel()
    if (model) {
      rtn = model["topics"].sort((a: any, b: any) => { return a["sequence"] - b["sequence"]; });
    }

    return rtn;
  }

  getLineItemsForATopic(topicId: number) {
    let rtn: any = undefined;

    let model: any = this.getModel();
    if (model) {
      let topic: any = model["topics"].find((t: any) => { return t["id"] === topicId; });

      if (topic) {
        rtn = topic["lineItems"].sort((a: any, b: any) => { return a["sequence"] - b["sequence"]; });
      }
    }

    return rtn;
  }

  getSkillsForALineItemAndLevel(lineItemId: number, level: number) {
    let rtn: any = undefined;

    let model: any = this.getModel();
    if (model) {
      let lineItem: any = model["topics"].flatMap((topic: any) => topic["lineItems"]).find((item: any) => item.id === lineItemId);

      if (lineItem) {
        rtn = lineItem["skills"].filter((s: any) => s["level"] === level).sort((a: any, b: any) => { return a["sequence"] - b["sequence"]; });
      }

      return rtn;
    }
  }
  /** ** */

}
