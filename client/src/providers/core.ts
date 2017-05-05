import { Injectable } from '@angular/core';
import { Platform } from "ionic-angular/platform/platform";
import { Observable } from "rxjs/Observable";
import { Http, Headers } from '@angular/http';
import 'rxjs/Rx';

@Injectable()
export class Core {
  url:string = 'http://localhost:3500/api/';

  constructor(public http: Http,
              public platform: Platform) {
  }

  public load (filters: any): Observable<any> {
    const url = this.url + 'words/?' 
      + 'filter=' + (filters.filter || '') + '&pos=' + (filters.pos || '') + '&dateFrom=' + (filters.dateFrom || '') + '&dateTo=' + (filters.dateTo || '');
    let req: Observable<any> = this.http.get(url);
    return req;
  }

  public getWordTrans (key): Observable<any> {
    const url = this.url + 'wordTransl/?'
      + 'word=' + (key || '') ;
    let req: Observable<any> = this.http.get(url);
       
    let mapped: Observable<any> = req.map(res => {
      if (!res) return [];
      let wordTrans = res.json().data;    
      let wordTransAlt = res.json().dataAlt; 
      var map = [];
      let singleArr = [];
      if (res.json().data) {      
        for (var i = 0; i < wordTrans.trgs.length; i++) {
          var dataElem = res.json().data.trgs[i];
          if (!dataElem.synset) {
            singleArr.push({ el1: {dataElem, trgExt: []},  el2: {trgs: [], trgExt: []} }); 
            continue;
          }
          map[dataElem.synset] = dataElem;          
        }
        for (var i = 0; i < wordTrans.trgExt.length; i++) {
          let dataElem = res.json().data.trgExt[i];
          singleArr.push({ el1: {trgs: [], trgExt: dataElem}, el2: {trgs: [], trgExt: []} }); 
        }
      }         
      if (res.json().dataAlt) {
        for (var i = 0; i < wordTransAlt.trgs.length; i++) {
          var altElem = res.json().dataAlt.trgs[i];
          var dataElem = map[altElem.synset] || {};
          if (!dataElem.trgs) {
            dataElem["trgs"] = []
          };
          singleArr.push({ el1: {dataElem, trgExt: []}, el2: {altElem, trgExt: []} });         
        }
        for (var i = 0; i < wordTransAlt.trgExt.length; i++) {
          let altElem = res.json().dataAlt.trgExt[i];
          singleArr.push({ el1: {trgs: [], trgExt: []}, el2: {trgs: [], trgExt: altElem} }); 
        }
      }
      return singleArr;
    });
    return mapped;
  }
public updateTrans (filters: any, arr: any[]) {
  const url = this.url + 'updTrans';
  let headers = new Headers();
  headers.append('Content-Type', 'text/plain');
  let stringToSend = JSON.stringify(arr);
  let req: Observable<any> = this.http.post(url, { word: filters.word, pos: filters.pos, stringArray: stringToSend }, { headers }); 
  return req;
  }
public addWordFromFilter (filters: any) {
  let url = 'http://localhost:3500/api/addWord';
  let headers = new Headers();
  headers.append('Content-Type', 'text/plain');
  let req: Observable<any> = this.http.post(url, { word: filters.word, pos: filters.pos }, { headers }); 
  return req;
  }
public addWordFromList (filters: any) {
   let url = 'http://localhost:3500/api/addTrans';
   let headers = new Headers();
   headers.append('Content-Type', 'text/plain');
   let req: Observable<any> = this.http.post(url, { word: filters.word, pos: filters.pos, from: filters.from}, { headers });   
   return req;
  }
}
