import {
  Component,
  OnInit,
  AfterViewInit,
  Injectable,
  Input,
  ViewContainerRef,
  ViewChild,
  ComponentFactoryResolver,
  TemplateRef, Output, EventEmitter, HostListener
} from '@angular/core';

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

  @Input() contextMenuContent!: TemplateRef<any>; // The component type to be passed from the host

  _controller: any = undefined;

  selectedMatrixIDs: Array<string> = [];
  selectedTopicIDs: Array<string> = [];
  selectedLineItemIDs: Array<string> = [];
  selectedSkillLevel: number = -1;
  selectedSkillIDs: Array<string> = [];

  expandedTopicIDs: Array<string> = [];
  expandedLineItemIDs: Array<string> = [];

  constructor() { }

  ngOnInit() {
    const self = this;
    self.ctrl.then((ctrl: any) => {

        ctrl.initModelService().then(() => {

            let defaultController = {
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

                      self.selectedSkillLevel = -1;
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
                        if (self.selectedSkillLevel === level)
                          self.selectedSkillLevel = -1;
                        else
                          self.selectedSkillLevel = level;
                          isSelected = true;
                      }
                    }
                  }

                  return isSelected;
                },
                _onSkillClick: (matrix: any, topic: any, lineItem: any, skill: any) => {
                  let isSelected = false;
                  if (self.selectedSkillIDs.length === 0) {
                    self.selectedSkillIDs.push(skill['id']);
                    isSelected = true;
                  } else {
                    if (self.allowMultiSelect) {
                      if (self.selectedSkillIDs.includes(skill['id'])) {
                        self.selectedSkillIDs = self.selectedSkillIDs.filter((thatId) => { return skill['id'] !== thatId; })
                        isSelected = false;
                      } else {
                        self.selectedSkillIDs.push(skill['id']);
                        isSelected = true;
                      }
                    } else {
                      if (self.selectedSkillIDs[0] === skill['id']) {
                        self.selectedSkillIDs = [];
                        isSelected = false;
                      } else {
                        self.selectedSkillIDs[0] = skill['id'];
                        isSelected = true;
                      }
                    }
                  }

                  self.selectedMatrixIDs = [matrix['id']];
                  self.selectedTopicIDs = [topic['id']];
                  self.selectedLineItemIDs = [lineItem['id']];
                  self.selectedSkillLevel = -1;

                  return isSelected;
                }

            }

            self._controller = { ...defaultController, ...ctrl };

            if (self._controller["isEditor"] && self._controller["isEditor"]()) {
              if (!self._controller["setResetCalculatedStuffCallback"])
                throw new Error("This is an editor, but the controller does not implement the setResetCalculatedStuffCallback method.");

              self._controller["setResetCalculatedStuffCallback"](() => {
                // throw error
                throw new Error("The skillsmatrix.component is not yet able to handle the resetCalculatedStuff callback.");
              })
            }

            // handle inits and provider funcs for the client..
          if ( self._controller["setProviderForSelectedMatrixIDs"]) {
            self._controller["setProviderForSelectedMatrixIDs"](() => {
              return self.selectedMatrixIDs.slice(0) // return a copy of the array
            });
          }
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
                return self.selectedSkillLevel;
              })
            }
            if ( self._controller["setProviderForSelectedSkillIDs"]) {
              self._controller["setProviderForSelectedSkillIDs"](() => {
                return self.selectedSkillIDs.slice(0) // return a copy of the array;
              })
            }

            if ( self._controller["skillsMatrixComponentFinishedLoadingEventHandler"]) {
              self._controller["skillsMatrixComponentFinishedLoadingEventHandler"](true);
            }
        });
      });
  }

  isColorMeaningStringShowing() {
    if (this._controller && this._controller["isColorMeaningStringShowing"]) {
      return this._controller["isColorMeaningStringShowing"]()
    } else {
      return true;
    }
  }

  isMatrixTitleShowing() {
    if (this._controller && this._controller["isMatrixTitleShowing"]) {
      return this._controller["isMatrixTitleShowing"]()
    } else {
      return true;
    }
  }

  isButtonBarShowing() {
    if (this._controller && this._controller["isButtonBarShowing"]) {
      return this._controller["isButtonBarShowing"]()
    } else {
      return true;
    }
  }

  isIndividualSkillSelectionAllowed() {
    if (this._controller && this._controller["isIndividualSkillSelectionAllowed"]) {
      return this._controller["isIndividualSkillSelectionAllowed"]()
    } else {
      return false;
    }
  }

  hasCustomButtons() {
    return this._controller && this._controller["getCustomButtons"] && this._controller["getCustomButtons"]().length > 0;
  }

  getCustomButtons() {
    if (this._controller && this._controller["getCustomButtons"]) {
      return this._controller["getCustomButtons"]()['buttons'];
    } else {
      return [];
    }
  }

  onCustomButtonClick(button: any) {
    button['handler']();
  }

  isCustomButtonDisabled(btn: any) {
    return btn['isDisabled']();
  }

  getCustomButtonColor(btn: any) {
    return btn['color']();
  }

  getName(skillsMatrixId: string) {
    if (this._controller && this._controller["getName"]) {
      return this._controller["getName"](skillsMatrixId);
    } else {
      throw new Error("The skillsmatrix controller has not implemented a required method: getName().");

      return "";
    }
  }

  getSkillsMatrixes() {
    if (this._controller && this._controller["getSkillsMatrixes"]) {
      return this._controller["getSkillsMatrixes"]();
    } else {
      throw new Error("The skillsmatrix controller has not implemented a required method: getSkillsMatrixes().");

      return [ ];
    }
  }

 getTopics(skillsMatrixId: string) {
    if (this._controller && this._controller["getTopics"]) {
      return this._controller["getTopics"](skillsMatrixId);
    } else {
      throw new Error("The skillsmatrix controller has not implemented a required method: getTopics().");

      return [ ];
    }
  }

  getLineItemsByTopic(topic: any) {
    if (this.areLineItemHeadersShowing(topic)) {
      if (this._controller && this._controller["getLineItemsByTopic"]) {
        return this._controller["getLineItemsByTopic"](topic);
      } else {
        throw new Error("The skillsmatrix controller has not implemented a required method: getLineItemsByTopic().");

        return [];
      }
    }
  }

  getSkills(lineItem: any, level: number) {
    if (this._controller && this._controller["getSkillsByLineItemAndLevel"]) {
      return this._controller["getSkillsByLineItemAndLevel"](lineItem, level);
    } else {
      throw new Error("The skillsmatrix controller has not implemented a required method: getSkillsByLineItemAndLevel().");

      return [ ];
    }
  }

  getSkillsShortList(lineItem: any, level: number) {
    if (this._controller && this._controller["getSkillsShortListByLineItemAndLevel"]) {
      return this._controller["getSkillsShortListByLineItemAndLevel"](lineItem, level);
    } else {
      return this.getSkills(lineItem, level).slice(0, 3);
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

  getSkillBorderStyle(skill: any) {
    if (this._controller &&
      ((this._controller["shouldShowSelectedSkillBorder"] && this._controller["shouldShowSelectedSkillBorder"](skill)) ||
        (!this._controller["shouldShowSelectedSkillBorder"]))) {
        if (this.isIndividualSkillSelectionAllowed()) {
          if (this._controller["getSkillBorderStyle"])
            return this._controller["getSkillBorderStyle"](skill, this.selectedSkillIDs.includes(skill['id']));
          else if (this.selectedSkillIDs.includes(skill['id']))
            return "dashed";
        }
      }

    return "";
  }

  getSkillBackgroundColor(lineItem: any, skill: any, index: number) {
    if (this._controller && this._controller["getSkillBackgroundColor"]) {

      if (this.isIndividualSkillSelectionAllowed()) {
        return this._controller["getSkillBackgroundColor"](lineItem, skill, index, this.selectedSkillIDs.includes(skill['id']));
      } else {
        const isLineItemSelected = this.selectedLineItemIDs.includes(lineItem['id']);
        const isThisSkillsLevelSelected = this.selectedSkillLevel === skill["level"];
        return this._controller["getSkillBackgroundColor"](lineItem, skill, index, isLineItemSelected && isThisSkillsLevelSelected);
      }
    } else {
      if (index % 2 == 0)
        return "white";
      else
        return "lightgray";
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

  onSkillClick(matrix: any, topic: any, lineItem: any, skill: any) {
    if (this._controller && this._controller["_onSkillClick"]) {
      let isSelected = this._controller["_onSkillClick"](matrix, topic, lineItem, skill);

      if (this._controller && this._controller["onSkillClick"]) {
        this._controller["onSkillClick"](matrix, topic, lineItem, skill, isSelected);
      }
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

  isFullDetailBtnEnabled() {
    return this.collapseToState != this._STATE_FULL_DETAIL;
  }

  isCollapseToTopicsBtnEnabled() {
    return this.collapseToState != this._STATE_TOPICS_ONLY;
  }

  isCollapseToTopicsAndLineItemsBtnEnabled() {
    return this.collapseToState != this._STATE_TOPICS_HEADERS;
  }

  getExpandCollapseTopicBtnText() {
    let text = "Mark as Expanded Topic";

    // if the selected topic id is in the expanded list, then we want to show the collapse text
    if (this.expandedTopicIDs.includes(this.selectedTopicIDs[0])) {
      text = "Mark as Collapsed Topic";
    }

    return text;
  }

  isExpandCollapseTopicBtnEnabled() {
    return this.collapseToState == this._STATE_TOPICS_ONLY && this.selectedTopicIDs.length > 0;
  }

  getExpandCollapseLineItemBtnText() {
    let text = "Mark as Expanded LI";

    // if the selected line item id is in the expanded list, then we want to show the collapse text
    if (this.expandedLineItemIDs.includes(this.selectedLineItemIDs[0])) {
      text = "Mark as Collapsed LI";
    }

    return text;
  }

  isExpandCollapseLineItemBtnEnabled() {
    return this.collapseToState == this._STATE_TOPICS_HEADERS && this.selectedLineItemIDs.length > 0;
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

  @Output() contextMenuTriggered: EventEmitter<any> = new EventEmitter<any>();

  onCDKContextMenuOpened(matrix: any, topic: any, lineItem: any, skill: any) {
    // do nothing
  }

  isCDKContextMenuEnabled(matrix: any, topic: any, lineItem: any, skill: any) {
    if (matrix && topic && lineItem && skill) {
      if (this._controller && this._controller["shouldContextMenuShow"]) {
        if (this._controller["shouldContextMenuShow"](matrix, topic, lineItem, skill)) {
          this.contextMenuTriggered.emit({matrix: matrix, topic: topic, lineItem: lineItem, skill: skill});
          return true;
        }
      }
    }

    return false;
  }

  onCDKContextMenuClosed() {
    // do nothing
  }
}
