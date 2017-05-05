import * as express from "express";
import * as bodyParser from "body-parser"
import * as router from './routes';
import * as cors from 'cors';

const app = express();

app.use(cors());
app.use('/', router);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(function(err, req, res, next) {
    err.status = 404;
    next(err);
});
app.use( function(err, req, res, next) {
    res.status(err.status || 500);
    if(err)
        console.trace(err);
    res.render('error', {
        message: err.message,
        error: {},
        title: '404 page not pound'
    });
});
const server = app.listen(3500, () => {
    console.log('Server listening on port 3500');
});
