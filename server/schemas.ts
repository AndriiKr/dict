import * as mongoose from "mongoose";

mongoose.connect("mongodb://localhost/polydb1");

const Schema = mongoose.Schema;

interface IDictBench {
  _id: mongoose.Types.ObjectId,
  word: string,
  pos: string,
  status: string,    
  dateUpdated: Date,
  trgExt: string[],
  trgs: [{
    synset: string,
    from: number,
    trgs: string[]
  }]
};
interface IDictBenchModel extends IDictBench, mongoose.Document{};
const dictBenchSchema = new Schema({
    word: String,
    pos: String,
    status: String,
    dateUpdated: Date,
    trgExt: [String],
    trgs: [{
      _id: false,
      synset: String,
      from: Number,
      trgs: [String]
    }]
}, { versionKey: false });

export function DictBench(lang) {
  return mongoose.model<IDictBenchModel>("dict-bench-" + lang, dictBenchSchema, "dict-bench-" + lang);
}

