import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlaygroundService } from './playground.service';
import { isNullOrUndefined } from 'util';

@Injectable()
export class OperationLogicService {
    constructor(private http: HttpClient, private pgSvc: PlaygroundService) {}

    parseJsonOperationForRun(jsonOperation) {}

    async execute(opItemType, input, body?) {
        let res = {};
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

                res['body'] = t;
                console.log('----RETURNING ', t);
                break;
            case 'operation':
                let bodyJson = await this.pgSvc.getOperationJSON(body.operationName).toPromise();
                res['body'] = await this.runOpLogic(bodyJson['jsonOperation'], input);

                break;
            case 'json-input':
                let obj = JSON.parse(body.content);
                res['body'] = obj;

                break;
            case 'inputContainer':
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
                    res['body'] = t[0][0][0];
                } else {
                    res['body'] = t;
                }

                break;
            case 'math':
                break;
            case 'javascript':
                const data = input;
                res['body'] = eval(body.content);
                break;
            default:
                console.log('no item of type :' + opItemType + ' is registered');
        }

        console.log('OpLogicService - Returned item promise ', res);
        return res['body'];
    }

    public async runOpLogic(opLogic, input) {
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
        console.log('TPL 1 : ', tempLinks);
        tempLinks.forEach(
            model =>
                isNullOrUndefined(links[model.origin]) ? (links[model.origin] = [model.target]) : links[model.origin].push(model.target)
        );
        console.log('TPL 2 : ', links);

        const END_ELEM_ID = 'i-op-0';

        if (isNullOrUndefined(links[ORIG_ELEM_ID]) || isNullOrUndefined(links[END_ELEM_ID])) {
            console.log('WARNING - Op not closed. Returning');
            alert('DevMode - Please close the OP circuit'); //TODO
            return false;
        }
        console.log('Running an operation composed of ' + elemCount + ' components');

        //  RUN  //

        //todo : move to another array container to allow chain branches
        let chain = []; //Promise.resolve();
        let elemMinus2 = '';
        chain = this.buildCallChain(allElements, links, ORIG_ELEM_ID, '5', chain, END_ELEM_ID, elemMinus2);
        console.log(chain);

        for (const p of chain) {
            await this.execute(p['itemType'], input, p['elemToExecute']).then(data => {
                console.log('result ', data);
                input = data;
            });
        }
        console.log('--- END : ', input);
        return input;
    }

    private buildCallChain(allElements, links, previousElem, input, chain, endElementId, elemMinus2): [{}] {
        const currentElemArr: [string] = links[previousElem];
        const currentElemId = currentElemArr.filter(str => !elemMinus2 || str != elemMinus2)[0];
        console.log('DEBUG------------- currentElemId arr links', currentElemId, currentElemArr, links);
        let elemToExecute = allElements[currentElemId];
        if (isNullOrUndefined(elemToExecute)) {
            console.log('returning');
            return chain;
        }
        let response: Promise<any>;

        const itemType: string = elemToExecute['OP_ITEM_TYPE'];
        if (itemType != 'holder') {
            //EXECUTE
            console.log('EXECUTE---', elemToExecute);
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
