import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlaygroundService } from './playground.service';
import { isNullOrUndefined } from 'util';
import { WsMessageService } from '../shared/tracker/ws-message.service';
import { Observable } from 'rxjs';

@Injectable()
export class OperationLogicService {
    constructor(private http: HttpClient, private pgSvc: PlaygroundService, private wsMessageService: WsMessageService) {}

    unsubscribeAll() {
        this.wsMessageService.unsubscribe('scala-ms-receiver');
    }

    async execute(opItemType, input, body?) {
        let res = {
            body: null
        };
        console.log('OpLogicService - Executing item of type ' + opItemType + ' with input : ' + input + ' and body:', body);
        switch (opItemType) {
            case 'api':
                let path;
                if (body.path.indexOf('{') < 0) {
                    path = body.msDTO.path + body.path;
                } else {
                    path = body.msDTO.path + body.path.split('{')[0] + input;
                    input = null;
                }
                console.log('TODO ---- EXECUTE API', path); // TODO
                //temporary
                if (path.startsWith('gtw/')) {
                    path = path.split('gtw/')[1];
                }
                //IF GET

                let t;
                if (body.reqType.toUpperCase() === 'GET') {
                    if (input) {
                    } else {
                        t = await this.http.get(path).toPromise();
                    }
                } else if (body.reqType.toUpperCase() === 'POST') {
                    t = await this.http.post(path, input).toPromise();
                }

                res.body = t;
                console.log('----RETURNING ', t);
                break;
            case 'operation': //only operations with input => promise, not observable
                let bodyJson = await this.pgSvc.getOperationJSON(body.operationName).toPromise();
                res.body = this.runOpLogic(bodyJson['jsonOperation'], input);

                break;
            case 'json-input':
                let obj = JSON.parse(body.content.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ').replace(/(')/g, '"'));
                res.body = obj;

                break;
            case 'inputContainer':
                break;
            case 'pipeline':
                //TODO
                console.log('---PIPELINE BODY ', body);
                //v1 : websocket
                this.wsMessageService.connect('scalams').then(queue => {
                    //TODO skip if already connected
                    console.log('CONNECTED TO WS : ', queue);
                });
                console.log('---SENDING RUN TO scalapipeline/api/test/ppl/run/' + body.trigger.outputEndpointURL);
                this.http.get('scalapipeline/api/test/proxy/run/' + body.trigger.outputEndpointURL).subscribe(
                    data => {
                        console.log('Running ppl ', data);
                        return true;
                    },
                    error => {
                        console.error('Error running ppl !');
                        return Observable.throw(error);
                    }
                );

                const self = this;
                setTimeout(function() {
                    self.wsMessageService.subscribe('scala-ms-receiver');
                    // self.wsMessageService.sendPplMessage('init'); //TODO GBO 0512
                }, 200);

                res.body = this.wsMessageService.receive().map(m => {
                    try {
                        m = JSON.parse(m.body.replace('\\', ''));
                    } catch (e) {
                        m = m.body;
                    }
                    return m;
                });

                break;
            case 'converter':
                break;
            case 'publicApi':
                //TODO use json param object instead
                let url;
                if (body._params) {
                    url = body._api;
                    for (let key in body._params) {
                        if (body._params[key] === '*?') {
                            body._params[key] = prompt(body.title + ' requires user input -' + key);
                        }
                        url = url.replace('{{' + key + '}}', body._params[key]);
                    }
                    url = url.replace('{{_}}', encodeURI(input));
                } else {
                    url = body._api.replace('{{_}}', encodeURI(input));
                }

                const t = await this.http.get(url).toPromise();

                if (t && t[0] && t[0][0]) {
                    res.body = t[0][0][0];
                } else {
                    res.body = t;
                }

                break;
            case 'math':
                break;
            case 'javascript':
                const data = input;
                res.body = eval(body.content);
                break;
            default:
                console.log('no item of type :' + opItemType + ' is registered');
        }

        console.log('OpLogicService - Returned item promise ', res.body);
        return res.body;
    }

    public runOpLogic(opLogic, input): Observable<any> {
        const logic = opLogic;
        console.log('RUN LOGIC ', opLogic);
        let excludedKeys = ['link', 'operationName', 'desc'];

        let elemCount = 0; //DEBUG
        let allElements = {};
        const ORIG_ELEM_ID = 'o-op-0';

        Object.keys(logic)
            .filter(key => excludedKeys.indexOf(key) < 0)
            .map(key => {
                Object.keys(logic[key]).map(elemId => {
                    console.log('extract at key ' + key, logic[key], elemId);
                    allElements[elemId] = logic[key][elemId];
                    allElements[elemId]['OP_ITEM_TYPE'] = key;
                    elemCount++;
                });
            });
        console.log('allElements : ', allElements);

        class LinkModel {
            constructor(public origin: string, public target: string) {}
        }
        let tempLinks: LinkModel[] = [];
        //get all links
        let links = {};

        Object.keys(logic['link']).forEach(orig => {
            let linkArr = logic['link'][orig];
            linkArr.forEach(lk => {
                tempLinks.push(new LinkModel(orig, lk.target));
                tempLinks.push(new LinkModel(lk.target, orig));
            });
        });
        tempLinks.forEach(
            model =>
                isNullOrUndefined(links[model.origin]) ? (links[model.origin] = [model.target]) : links[model.origin].push(model.target)
        );
        const END_ELEM_ID = 'i-op-0';

        if (isNullOrUndefined(links[ORIG_ELEM_ID]) || isNullOrUndefined(links[END_ELEM_ID])) {
            console.log('WARNING - Op not closed. Returning');
            alert('DevMode - Please close the OP circuit'); //TODO
            return Observable.never();
        }
        console.log('Running an operation composed of ' + elemCount + ' components');

        //  RUN  //

        //todo : move to another array container to allow chain branches
        let chain = []; //Promise.resolve();
        let elemMinus2 = '';
        chain = this.buildCallChain(allElements, links, ORIG_ELEM_ID, '5', chain, END_ELEM_ID, elemMinus2);
        console.log(chain);

        let i = 0;
        let next = () => chain[i++];
        let self = this;
        function getNext(inputVal): any {
            let nx = next();
            return self.execute(nx['itemType'], inputVal, nx['elemToExecute']);
        }
        function getOne(idx, inputVal): any {
            let nx = chain[idx];
            return self.execute(nx['itemType'], inputVal, nx['elemToExecute']);
        }
        const firstRes: any = getNext(input);
        let obs = null;
        obs = this.asObservable(firstRes);

        for (let x = 1; x < chain.length; x++) {
            const i = x;
            obs = obs.map(prev => {
                return getOne(i, prev);
            });
        }
        //temp1.subscribe(data=>console.log(data))
        return obs;
    }

    public asObservable(some): Observable<any> {
        if (some instanceof Observable) {
            return some;
        } else if (some instanceof Promise) {
            let prom: Promise = some;
            return new Observable<any>(observer => {
                prom.then(obs => this.flattenObservable(obs, observer));
            });
        } else {
            return Observable.of(some);
        }
    }
    private flattenObservable(some, observer) {
        if (some instanceof Observable) {
            some.subscribe(data => {
                this.flattenObservable(data, observer);
            });
        } else {
            this.asObservable(some).subscribe(data => {
                observer.next(data);
            });
        }
    }

    private buildCallChain(allElements, links, previousElem, input, chain, endElementId, elemMinus2): [{}] {
        const currentElemArr: [string] = links[previousElem];
        const currentElemId = currentElemArr.filter(str => !elemMinus2 || str != elemMinus2)[0];
        let elemToExecute = allElements[currentElemId];
        if (isNullOrUndefined(elemToExecute)) {
            return chain;
        }
        let response: Promise<any>;

        const itemType: string = elemToExecute['OP_ITEM_TYPE'];
        if (itemType != 'holder') {
            chain.push({ itemType: itemType, input: input, elemToExecute: elemToExecute });
            // response = this.opLogicService.execute(itemType, this.output, elemToExecute);
        } else {
            //HOLDERS AND DIVIDERS
            console.log('TODO holders and dividers');
        }
        elemMinus2 = previousElem;
        previousElem = currentElemId;

        return this.buildCallChain(allElements, links, previousElem, input, chain, endElementId, elemMinus2);
    }
}
