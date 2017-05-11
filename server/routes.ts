import * as express from "express";
import { DictBench } from "./schemas"

const router = express.Router();
const lang = 'es'; //tbd: make parameter
const altLang = 'en'; //tbd: make parameter

router.get('/api/words', (req, res) => {
    let opts: any = {};
    if (req.query.filter || req.query.pos) {
        if (req.query.filter) {
            opts.word = { "$regex": req.query.filter };
        };
        if (req.query.pos) {
            opts.pos = { "$regex": req.query.pos };
        }
        let dFrom = req.query.dateFrom;
        let dTo = req.query.dateTo;
        if (dFrom || dTo) {
            opts.dateUpdated = {};
            if (dFrom) {
                opts.dateUpdated["$gt"] = new Date(dFrom);
            }
            if (dTo) {
                opts.dateUpdated["$lt"] = new Date(dTo);
            }
        }
    }
    const query = DictBench(lang).find(opts).limit(10);
    query.exec((err, data: any) => {
        data = data.map(x => x.toObject());
        if (err) {
            res.json({ error: err });
        };
        res.json({ data: data });
    });
});

router.post('/api/addTrans', (req, res) => {
    let text = '';
    req.setEncoding('utf8');
    req.on('data', chunk => text += chunk);
    req.on('end', () => {
        let data = JSON.parse(text);
        let word = DictBench(lang).create({
            word: data.word,
            pos: data.pos,
            status: 'PND',
            dateUpdated: new Date()
        }, (err) => {
            if (err) {
                res.json({
                    status: false,
                    error: err
                });
            } else {
                res.json({ status: true });
            }
        });
    });
});

router.get('/api/wordTransl', (req, res) => {
    let opts: any = {};
    if (req.query.word) {
        opts.word = req.query.word;
    }
    let query = DictBench(lang).find(opts);
    query.exec((err, data: any) => {
        data = data.map(x => x.toObject());
        if (err) {
            res.json({ error: err });
            return;
        };
        let query = DictBench(altLang).find(opts);
        query.exec((err, dataAlt: any) => {
            dataAlt = dataAlt.map(x => x.toObject());
            if (err) {
                res.json({ error: err });
                return;
            };
            res.json({ data: data[0], dataAlt: dataAlt[0] });
        });
    })
});

router.post('/api/updTrans', (req, res) => {
    let text = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => text += chunk);
    req.on('end', () => {
        let data = JSON.parse(text);
        let dataArray = JSON.parse(data.stringArray);
        let arrIns: any = [];
        let arrInsExt: any = [];
        dataArray.forEach((arrayItemExt) => {
            if (arrayItemExt.el1.dataElem) {
                if (typeof (arrayItemExt.el1.dataElem.trgs) === "string") {
                    let bufferArray = arrayItemExt.el1.dataElem.trgs.split(';').map((item) => { return item.trim() });
                    arrayItemExt.el1["synset"] = arrayItemExt.el2.altElem ? arrayItemExt.el2.altElem.synset : null;
                    arrayItemExt.el1["trgs"] = bufferArray;
                    if (arrayItemExt.el1.dataElem.trgs.length > 0) {
                        arrIns.push(arrayItemExt.el1);
                    }
                    if (arrayItemExt.el1.dataElem["trgs"].length > 0) {
                        arrIns.push(arrayItemExt.el1.dataElem);
                    }
                } else {
                    arrayItemExt.el1.dataElem.trgs.forEach((trg) => {
                        if (typeof (trg) === "string") {
                            if (trg.length > 0) {
                                arrIns.push(arrayItemExt.el1.dataElem);
                            }
                        }
                    });
                }
            }

            let buffInsExt: any = [];
            if (arrayItemExt.el1.trgExt && (typeof (arrayItemExt.el1.trgExt) === "string")) {
                let bufferArray = arrayItemExt.el1.trgExt.split(';').map((item) => { return item.trim() });
                arrayItemExt.el1["trgExt"] = bufferArray;
            }
            if (arrayItemExt.el1["trgExt"] && arrayItemExt.el1["trgExt"].length > 0) {
                arrInsExt.push(arrayItemExt.el1["trgExt"]);
            }
        });
        if (arrIns.length > 1) {
            arrIns.splice(1, 1);
        }
        DictBench(lang).findOneAndUpdate(
            { word: data.word },
            { $set: { "trgs": arrIns, "trgExt": arrInsExt, "dateUpdated": Date() } },
            { upsert: true, new: true }, (err) => {
                if (err) {
                    res.json({ error: err });
                };
                res.send({ success: true });
            });
    });
});

export = router;