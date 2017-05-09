import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { FormsModule } from '@angular/forms'
import 'rxjs/Rx';

import { Http, Headers } from '@angular/http';

import { Core } from "../../providers/core";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  filter: string = '';
  pos: string = '';
  words: any[] = [];
  translate: any;
  current: any;
  curentWordInd: Boolean = null;
  currentDetail: any;
  currentDetailString: string = '';
  dateFrom: Date;
  dateTo: Date;
  addReq: Boolean = null;
  showTranslation: Boolean = null;
  posIns: string = '';
  wordIns: string = '';
  fromIns: number;
  filterDis: Boolean = null;
  editMode: Boolean = null;
  addButtonDisabled: Boolean = null;
  singleArr: any[] = [];
  inputValue: Boolean = null;

  constructor(public navCtrl: NavController,
    public http: Http,
    private core: Core) {
    this.load();
  }

  load() {
    this.resetTranslationArr();
    let filters = {
      filter: this.filter.toLowerCase(),
      pos: this.pos,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    };
    let req = this.core.load(filters).catch(this.handleError);
    req.subscribe(res => {
      if (!res) return;
      this.words = res.json().data;
      this.words.map(word => word.dateUpdated = word.dateUpdated.substr(0, 10));
    });
    this.showTranslation = null;
    this.editMode = null;
  }
  handleError(error) {
    console.error(error);
    return Observable.throw(error.json().error || 'Server error');
  }
  itemSelected(item) {
    this.current = item;
    this.curentWordInd = true;
    this.getWordTrans();
    this.getWordInfo();
    this.editMode = null;
    this.showTranslation = true;
  }

  getWordInfo() {

  }
  itemSelectedDetail(item) {
    let curStr: string[] = [];
    let curStrWorking: string[] = [];
    this.currentDetail = item;
    curStrWorking = this.currentDetail.el1.dataElem ? this.currentDetail.el1.dataElem.trgs : [''];
    if (typeof (curStrWorking) === "string") {
      curStr = this.currentDetail.el1.dataElem.trgs.split(',');
    }
    else {
      curStr = curStrWorking;
    }
    this.currentDetailString = this.arrayToString(curStr);
  }
  itemColorDetail(item): Boolean {
    return item == this.currentDetail ? true : false;
  }
  itemColor(item): Boolean {
    return item == this.current ? true : false;
  }
  filterChange() {
    this.load();
  }
  arrayToString(arr: string[]) {
    return !arr ? '' : arr.join('; ');
  }
  addWordFromList() {
    let filters = {
      word: this.wordIns.trim(),
      pos: this.posIns.trim(),
      from: 10
    };
    let req = this.core.addWordFromList(filters).catch(this.handleError);
    req.subscribe(res => {
      const response = JSON.parse(res._body)
      if (!res) return;
      if (response.error) {
        alert('Word already exists');
        return;
      }
      alert('Your new word was successfully added');
      this.filter = this.wordIns;
      this.pos = this.posIns;
      this.dateFrom = null;
      this.dateTo = null;
      this.filterDis = true;
      this.addReqInd();
      this.load();
    });
  }
  addReqInd() {
    this.addReq = this.addReq ? false : true;
    this.posIns = '';
    this.wordIns = '';
  }
  filterCheck() {
    this.filterDis = this.filterDis ? null : true;
  }
  isDisabled() {
    return this.filterDis;
  }
  addDisabled() {
    return this.editMode ? true : null;
  }
  getWordTrans() {
    let req = this.core.getWordTrans(this.current.word).catch(this.handleError);
    req.subscribe(res => {
      this.singleArr = res;
    });
  }
  editTranslation() {
    this.singleArr[this.singleArr.length] = { el1: { trgExt: '' }, el2: { trgExt: '' } };
    this.editMode = this.editMode ? null : true;
    this.showTranslation = null;
  }
  cancelEditTrans() {
    this.editMode = this.editMode ? null : true;
    this.showTranslation = true;
    this.getWordTrans();
  }
  trgsRender(trgs) {
    if (typeof trgs == 'string') return trgs;
    if (typeof trgs == 'undefined' || trgs == null) return '';
    return trgs.join(';');
  }
  transChange(trans, id) {
    let elem: any = document.getElementById(id);
    if (typeof trans.el1.dataElem !== 'undefined') {
      trans.el1.dataElem.trgs = elem.value;
    }
    else {
      if (typeof trans.el1.trgExt !== 'undefined')
        trans.el1.trgExt = elem.value;
    }
  }
  updateTranslation() {
    let filters = {
      word: this.current.word,
      pos: this.current.pos
    };
    let req = this.core.updateTrans(filters, this.singleArr).catch(this.handleError);
    req.subscribe(res => {
      if (!res) return;
      if (res.error) {
        alert('Error: ' + res.error);
      }
      else {
        this.editMode = this.editMode ? null : true;
        this.showTranslation = true;
      }
    });
    this.getWordTrans();
  }

  resetTranslationArr() {
    this.singleArr = [];
  }
  renderTranslationElement(synset, trgs, trgExt) {
    let retElem = synset ? this.trgsRender(trgs) : this.trgsRender(trgExt);
    return retElem;
  }
    renderTranslationElementEdit(synset, trgs, trgExt) {
    let retElem = synset ? this.trgsRender(trgs) : this.trgsRender(trgExt);
    this.inputValue = retElem ? true : null;
    return retElem;
  }
}