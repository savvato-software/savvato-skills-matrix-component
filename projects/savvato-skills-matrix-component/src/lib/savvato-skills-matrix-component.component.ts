import { Component, OnInit, Injectable, Input } from '@angular/core';

import { ReadOnlySkillsMatrixModelService as DefaultSkillsMatrixModelService } from '@savvato-software/savvato-skills-matrix-services';

import * as jp from 'jsonpath';

// This component presents a view of the skills matrix.
//
// It is included within a larger component, for instance the question edit page (which needs a skills matrix
//  so as to associate a question with various cells), or the skills matrix editor (which allows the user to
//  change the order of the skills, add new ones, etc.). The larger component therefore defines the meaning
//  and behavior of the skills matrix it presents. For instance, the skills matrix editor will need to allow
//  a row to be moved, but the question editor does not need this behavior.
//
// The custom behavior is supplied by the 'ctrl' object which is passed as a parameter to this component by
//  its containing component. This component defines a set of functions which it calls in order to respond to
//  some user action. The ctrl object overrides those functions to provide the custom behavior. If a containing
//  component does not need that behavior, it does not override the method.

// The SM component uses a controller object, provided by the component which references the SM component in its template.
//  this controller object
//    - contains methods which provide the data for the SM: its topics, line items, etc.
//    - contains handlers for what happens when you click on an element in the SM. By default, these implement the
//      selecting behavior: selecting a topic, selecting a line item, etc.
//    - contains setter functions which allow the SM component to call the containing component and pass it a list of
//      the IDs of the selected components.



@Injectable({
    providedIn: 'root'
})
@Component({
  selector: 'lib-skills-matrix-component',
  templateUrl: './savvato-skills-matrix-component.component.html',
  styleUrls: ['./savvato-skills-matrix-component.component.scss']
})
export class SavvatoSkillsMatrixComponentComponent implements OnInit {

  @Input() ctrl: any;
  @Input() allowMultiSelect: boolean = false;

  _controller: any = undefined;

  selectedTopicIDs: Array<number> = [];
  selectedLineItemIDs: Array<number> = [];
  selectedSkillLevelID: number = -1;

  expandedTopicIDs: Array<number> = [];
  expandedLineItemIDs: Array<number> = [];

  smmsvc: any = undefined;

  constructor(private defaultSMMSvc: DefaultSkillsMatrixModelService) { }

  ngOnInit() {
    let self = this;
    self.ctrl.then((ctrl: any) => {

        /*
          If our view of the skillsmatrix.component is one that can change its state,
          for example, move its line items, or change the lineItem's skills perhaps,
          then that view needs to manage the state. This is because if something changes,
          it is complicated to tell this component "hey something in my copy of the state changed.
          Now you update your copy." It is easier to just have this component be supplied a
          copy of the state.

          This is where getSkillsMatrixModelService() on the controller is useful.

          If the view is read-only, as in any case that doesn't edit the skillsmatrix, then
          you don't need to supply a skillsMatrixModelService. In that case, the component
          will use its own default service. This keeps the client code simpler. You will need to
          supply an environment object, as the component will make a backend call, and needs to
          know which url to hit.
        */

        let skillsMatrixId: number = ctrl.getSkillsMatrixId();

        if (isNaN(skillsMatrixId) || skillsMatrixId < 1)
          throw new Error("The skillsMatrixId provided by the controllers getSkillsMatrixId() method was invalid.");

        (ctrl.getSkillsMatrixModelService) ?
          this.initModelForPotentialUpdates(self, ctrl)
          : this.initModelForReadOnly(self, ctrl);

        // wait for the skills matrix service to load, then.....
        self.smmsvc.waitingPromise().then(() => {

            let defaultController = {
                getModel: () => {
                  return self.smmsvc.getModel();
                },
                getProfileName: () => {
                  return self.smmsvc.getName();
                },
                getProfileTopics: () => {
                  return self.smmsvc.getTopics();
                },
                getProfileLineItemsByTopic: (topic: any) => {
                  return self.smmsvc.getLineItemsForATopic(topic['id']);
                },
                getSkillsByLineItemAndLevel: (lineItem: any, level: number) => {
                  return self.smmsvc.getSkillsForALineItemAndLevel(lineItem['id'], level);
                },
                _onTopicClick: (topic: any) => {
                  let thisId = topic['id'];
                  let isSelected = undefined;

                  if (self.selectedTopicIDs.length === 0) {
                    self.selectedTopicIDs.push(thisId);
                    isSelected = true;
                  } else {
                    if (self.allowMultiSelect) {
                      if (self.selectedTopicIDs.find((thatId) => { return thisId === thatId; })) {
                        self.selectedTopicIDs = self.selectedTopicIDs.filter((thatId) => { return thisId !== thatId; })
                        isSelected = false;
                      } else {
                        self.selectedTopicIDs.push(thisId);
                        isSelected = true;
                      }
                    } else {
                      if (self.selectedTopicIDs[0] === thisId) {
                        self.selectedTopicIDs = [];
                        isSelected = false;
                      } else {
                        self.selectedTopicIDs[0] = thisId;
                        isSelected = true;
                      }
                    }
                  }

                  return isSelected;
                },
                _onLineItemClick: (lineItem: any) => {
                  let thisId = lineItem['id'];
                  let isSelected = undefined;
                  if (self.selectedLineItemIDs.length === 0) {
                    self.selectedLineItemIDs.push(thisId);
                    isSelected = true;
                  } else {
                    if (self.allowMultiSelect) {
                      if (self.selectedLineItemIDs.includes(thisId)) {
                        self.selectedLineItemIDs = self.selectedLineItemIDs.filter((thatId) => { return thisId !== thatId; })
                        // TODO handle 'clearing the skill level for this line item' logic
                        isSelected = false;
                      } else {
                        self.selectedLineItemIDs.push(thisId);
                        isSelected = true;
                      }
                    } else {
                      if (self.selectedLineItemIDs[0] === thisId) {
                        self.selectedLineItemIDs = [];
                        isSelected = false;
                      } else {
                        self.selectedLineItemIDs[0] = thisId;
                        isSelected = true;
                      }

                      self.selectedSkillLevelID = -1;
                    }
                  }

                  return isSelected;
                },
                _onLxClick: (lineItem: any, level: number) => {
                  let isSelected = false;
                  let thisLineItemId = lineItem['id'];

                  if (self.selectedLineItemIDs.length > 0) {
                    if (self.allowMultiSelect) {
                      if (self.selectedLineItemIDs.includes(thisLineItemId)) {
                        // TODO implement
                      }
                    } else {
                      if (self.selectedLineItemIDs[0] === thisLineItemId) {
                        if (self.selectedSkillLevelID === level)
                          self.selectedSkillLevelID = -1;
                        else
                          self.selectedSkillLevelID = level;
                          isSelected = true;
                      }
                    }
                  }

                  return isSelected;
                }
            }

            self._controller = { ...defaultController, ...ctrl };

            // handle inits and provider funcs for the client..
            if ( self._controller["setProviderForSelectedTopicIDs"]) {
              self._controller["setProviderForSelectedTopicIDs"](() => {
                return self.selectedTopicIDs.slice(0) // return a copy of the array
              });
            }
            if ( self._controller["setProviderForSelectedLineItemIDs"]) {
              self._controller["setProviderForSelectedLineItemIDs"](() => {
                return self.selectedLineItemIDs.slice(0) // return a copy of the array
              });
            }
            if ( self._controller["setProviderForSelectedLevelID"]) {
              self._controller["setProviderForSelectedLevelID"](() => {
                return self.selectedSkillLevelID;
              })
            }

            // Note, no need for a setProviderForSelectedSkillIDs because
            //  you can't select individual skills from the component. You
            //  select a skill level, and then the page doing the selecting
            //  will have a means of editing the skills that apply to that
            //  level. Eventually, skill level selection will happen, I'm sure.

            if ( self._controller["skillsMatrixComponentFinishedLoadingEventHandler"]) {
              self._controller["skillsMatrixComponentFinishedLoadingEventHandler"](true);
            }
        });
      });
  }

  private initModelForPotentialUpdates(self: this, ctrl: any) {
    // write capable view, supplies its own skillsmatrixservice
    self.smmsvc = ctrl.getSkillsMatrixModelService();
    self.smmsvc._init(ctrl.getSkillsMatrixId(), true /* force init */);

    // set a callback to be called when skills matrix has changed (for instance, a line item deleted or added)
    self.smmsvc.setResetCalculatedStuffCallback(() => {
      let skillsMatrix = self.smmsvc.getModel();

      if (skillsMatrix) {
        // get all getLineItems
        let allLineItemIds: any = jp.query(skillsMatrix, "$..lineItems");
        allLineItemIds = allLineItemIds.flat();
        allLineItemIds = allLineItemIds.map((li: any) => li['id']);

        // if there is any selected line item id, which does not appear in the list of all line items, remove it
        self.selectedLineItemIDs = self.selectedLineItemIDs.filter(id => allLineItemIds.includes(id))
      }
    })
  }

  private initModelForReadOnly(self: this, ctrl: any) {
    // read only view
    self.smmsvc = self.defaultSMMSvc;

    self.smmsvc.setEnvironment(ctrl.getEnv());
    self.smmsvc._init(ctrl.getSkillsMatrixId(), true);

    if (ctrl.setRefreshFunc) {
      // pass a function back to the client, one that it can call to let us know to refresh our data
      ctrl.setRefreshFunc(() => {
        self.smmsvc.waitingPromise().then(() => self.smmsvc.reset())
      })
    }
  }

  isButtonBarShowing() {
    if (this._controller && this._controller["isButtonBarShowing"]) {
      return this._controller["isButtonBarShowing"]()
    } else {
      return true;
    }
  }

  getProfileName() {
    if (this._controller && this._controller["getProfileName"]) {
      return this._controller["getProfileName"]();
    } else {
      return "";
    }
  }

  getProfileTopics() {
    if (this._controller && this._controller["getProfileTopics"]) {
      return this._controller["getProfileTopics"]();
    } else {
      return [ ];
    }
  }

  getProfileLineItemsByTopic(topic: any) {
    // TODO: change this to getLineItemsByTopic
    if (this._controller && this.areLineItemHeadersShowing(topic) && this._controller["getProfileLineItemsByTopic"]) {
      return this._controller["getProfileLineItemsByTopic"](topic);
    } else {
      return [ ];
    }
  }

  getSkills(lineItem: any, level: number) {
    if (this._controller && this._controller["getSkillsByLineItemAndLevel"]) {
      return this._controller["getSkillsByLineItemAndLevel"](lineItem, level);
    } else {
      return [ ];
    }
  }

  getBackgroundColor(lineItem: any, idx: number) {
    if (this._controller && this._controller["getBackgroundColor"]) {
      return this._controller["getBackgroundColor"](lineItem, idx);
    } else {
      return "white";
    }
  }

  getColorMeaningString() {
    if (this._controller && this._controller["getColorMeaningString"]) {
      return this._controller["getColorMeaningString"]();
    } else {
      return "";
    }
  }

  getSkillBackgroundColor(lineItem: any, skill: any) {
    if (this._controller && this._controller["getSkillBackgroundColor"]) {
      const isLineItemSelected = this.selectedLineItemIDs.includes(lineItem['id']);
      const isThisSkillsLevelSelected = this.selectedSkillLevelID === skill["level"];

      return this._controller["getSkillBackgroundColor"](lineItem, skill, isLineItemSelected && isThisSkillsLevelSelected);
    } else {
      return "white";
    }
  }

  getLineItemBackgroundColor(lineItem: any) {
    if (this._controller && this._controller["getLineItemBackgroundColor"]) {
      return this._controller["getLineItemBackgroundColor"](lineItem, this.selectedLineItemIDs.includes(lineItem['id']), !this.isFullDetailShowing(lineItem));
    } else {
      return undefined; // use default color defined in our css
    }
  }

  getTopicBackgroundColor(topic: any) {
    if (this._controller && this._controller["getTopicBackgroundColor"]) {
      return this._controller["getTopicBackgroundColor"](topic, this.selectedTopicIDs.includes(topic['id']), !this.areLineItemHeadersShowing(topic));
    } else {
      return undefined; // use default color defined in our css
    }
  }

  onLxClick(lineItem: any, idx: number) {
    if (this._controller && this._controller["_onLxClick"]) {
      return this._controller["_onLxClick"](lineItem, idx);
    }
  }

  onLineItemNameClick(lineItem: any) {
    if (this._controller && this._controller["_onLineItemClick"]) {
      let isSelected = this._controller["_onLineItemClick"](lineItem);

      if (this._controller && this._controller["onLineItemClick"]) {
        this._controller["onLineItemClick"](lineItem, isSelected);
      }
    }
  }

  onTopicNameClick(topic: any) {
    if (this._controller && this._controller["_onTopicClick"]) {
      let isSelected = this._controller["_onTopicClick"](topic);

      if (this._controller && this._controller["onTopicClick"]) {
        this._controller["onTopicClick"](topic, isSelected);
      }
    }
  }

  onExpandLineItemBtnClick() {
    if (this.allowMultiSelect === false) {
      let currSelectedId = this.selectedLineItemIDs[0];
      if (this.expandedLineItemIDs.includes(currSelectedId)) {
        this.expandedLineItemIDs = this.expandedLineItemIDs.filter((existingId) => { return existingId !== currSelectedId })
      } else {
        this.expandedLineItemIDs.push(currSelectedId)
      }
    }
  }

  onExpandTopicBtnClick() {
    if (this.allowMultiSelect === false) {
      let currSelectedId = this.selectedTopicIDs[0];
      if (this.expandedTopicIDs.includes(currSelectedId)) {
        this.expandedTopicIDs = this.expandedTopicIDs.filter((existingId) => { return existingId !== currSelectedId })
      } else {
        this.expandedTopicIDs.push(currSelectedId)
      }
    }
  }

  _STATE_TOPICS_ONLY = 'topicsOnly'
  _STATE_TOPICS_HEADERS = 'topicsHeaders'
  _STATE_FULL_DETAIL = 'fullDetail'
  collapseToState = this._STATE_FULL_DETAIL;

  onTopicsOnlyBtnClick() {
    this.collapseToState = this._STATE_TOPICS_ONLY;
  }

  onTopicsAndHeadersBtnClick() {
    this.collapseToState = this._STATE_TOPICS_HEADERS;
  }

  onTopicsHeadersAndDetailBtnClick() {
    this.collapseToState = this._STATE_FULL_DETAIL;
  }

  areLineItemHeadersShowing(topic: any) {
    if (this.expandedTopicIDs.includes(topic['id'])) {
      return true;
    }

    return this.collapseToState === this._STATE_FULL_DETAIL || this.collapseToState === this._STATE_TOPICS_HEADERS;
  }

  isFullDetailShowing(lineItem: any) {
    if (this.expandedLineItemIDs.includes(lineItem['id'])) {
      return true;
    }

    return this.collapseToState === this._STATE_FULL_DETAIL;
  }
}
