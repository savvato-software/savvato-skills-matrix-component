import { Injectable } from '@angular/core';

import { FunctionPromiseService } from '@savvato-software/savvato-javascript-services'

import { TechProfileAPIService } from '@savvato-software/savvato-skills-matrix-services'

@Injectable({
  providedIn: 'root'
})
export class SavvatoSkillsMatrixComponentService {

  env: any = undefined;

  constructor(protected _skillsMatrixAPI: TechProfileAPIService,
    private _functionPromiseService: FunctionPromiseService) { }

  _init(env: any) {
    let self = this;

    self._skillsMatrixAPI.setEnvironment(env);

    self._functionPromiseService.initFunc("THE-TP", () => {
      return new Promise((resolve, reject) => {
        self._skillsMatrixAPI.get(1).then((tp) => {
          resolve(tp);
        })
      })
    })
  }

  reset() {
    this._functionPromiseService.reset("THE-TP");
  }

  waitingPromise() {
    return this._functionPromiseService.waitAndGet("THE-TP", "THE-TP", { 'freshnessLengthInMillis': 60000 * 10 });
  }

  /** ** */
  /*    dtim-techprofile-component model service methods */
  /** ** */
  getModel() {
    return this._functionPromiseService.get("THE-TP", "THE-TP", { 'freshnessLengthInMillis': 60000 * 10 });
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
  /** ** */

}
