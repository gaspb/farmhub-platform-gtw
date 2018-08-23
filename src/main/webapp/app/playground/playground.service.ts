import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { MSDTO } from './msdto.model';
import { ApiDoc } from './apidoc.model';
import { stringifyIgnoringKey } from '../shared/model/json-util';
import { isNullOrUndefined } from 'util';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable()
export class PlaygroundService {
    routes: MSDTO[];
    response: String;

    constructor(private http: HttpClient) {}
    getEndpoints() {
        return this.http.get('api/fwk/endpoints/').map((res: HttpResponse<String>) => res.toString());
    }

    getSessionTemplateHTML() {
        return this.http.get('api/playground/full/');
    }
    getOperationJSON(opName) {
        const httpOptions2 = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' })
        };
        return this.http.post('api/playground/op/name/', JSON.stringify({ operationName: opName }), httpOptions2);
    }
    getOperationList() {
        return this.http.get('api/playground/oplist/');
    }
    saveFullSessionTemplate(tpHtml, opHtml) {
        console.log('SAVING FULL TEMPLATE', tpHtml, opHtml);
        const body = JSON.stringify({ htmlTemplate: tpHtml, htmlOperation: opHtml });
        const headers = new HttpHeaders();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        return this.http.post('api/playground/full/', body, httpOptions);
    }
    saveOperation(opName, opJson) {
        console.log('SAVING OP ', opName);
        const opDesc = this.buildOpDesc(opJson, opName);
        const body = stringifyIgnoringKey({ json: { operationName: opName, jsonOperation: opJson }, desc: opDesc }, 'apiDoc');
        console.log('body', body);
        const headers = new HttpHeaders();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        return this.http.post('api/playground/op/', body, httpOptions);
    }
    saveTemplate(tpName, tpJson) {
        //TODO
    }
    private buildOpDesc(json, name) {
        //TODO
        return {
            operationName: name,
            desc: 'mockDesc',
            input: 'string',
            output: 'string'
        };
    }
    getPublicApiList() {
        return this.http.get('api/playground/public-api/all');
    }

    getRegisteredMS() {
        return this.http.get('api/playground/registered-ms/all');
    }

    getMockMS() {}

    getMockOp() {
        return [
            {
                title: 'Mock_Op_1',
                desc: 'Does nothing',
                body: {
                    inputType: 'string',
                    inputDesc: 'some input',
                    outputType: 'json',
                    outputDesc: 'some Output'
                }
            }
        ];
    }
    getMockPublicApis() {
        return [
            {
                title: 'Google Translate =>FR',
                desc: 'translates anything to french',
                body: {
                    inputType: 'string',
                    outputType: 'json'
                },
                _api: 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fr&dt=t&q={{_}}',
                _transformation: encodeURI
            },
            {
                title: 'Google Translate',
                desc: 'translates any to any',
                body: {
                    inputType: 'string',
                    outputType: 'json'
                },
                _api: 'https://translate.googleapis.com/translate_a/single?client=gtx&sl={{from}}&tl={{to}}&dt=t&q={{_}}',
                _transformation: encodeURI,
                _params: {
                    from: '*?',
                    to: '*?'
                }
            }
        ];
    }
    getMockConverters() {
        return [
            {
                convType: 'embedded',
                title: 'Automatic',
                desc: "we'll handle that for you",
                body: {
                    inputType: 'file',
                    outputType: 'json',
                    parameters: null
                }
            },
            {
                convType: 'map',
                title: 'en-str-as-bool',
                desc: 'converts english input to boolean',
                body: {
                    inputType: 'string',
                    outputType: 'boolean',
                    contentType: 'json',
                    content: [{ on: true }, { off: true }, { true: true }, { false: false }, { yes: false }, { no: false }]
                }
            }
        ];
    }

    mapSwaggetToMsDTO(swaggerApis) {
        return swaggerApis.map(api => {
            let routes: ApiDoc[] = [];
            //TODO make a custom swagger parser to retieve the real basepath and just the needed intels from /v2/docs
            const ms: MSDTO = new MSDTO(api.info.title.split(' API')[0] + '/', api.info.title, [api.host], null, api.definitions, routes);
            Object.keys(api.paths).map(routeName => {
                const routeContent = api.paths[routeName];
                const activeTypes: string[] = Object.keys(routeContent).filter(key => !isNullOrUndefined(routeContent[key]));
                activeTypes.forEach(type => {
                    console.log('MAPSWAGGERTODTOP==>MAPpING API - responses for type', routeContent[type], routeContent[type].responses);
                    routes.push(
                        new ApiDoc(
                            routeName.substring(1),
                            routeContent[type].summary,
                            type.toUpperCase(),
                            api.info.title,
                            [api.host],
                            null,
                            null,
                            routeContent[type].consumes,
                            routeContent[type].parameters,
                            this.getPrettifiedJSONApi(ms, routeContent[type].parameters),
                            routeContent[type].produces,
                            !routeContent[type].produces ? null : this.getJSONResponseType(ms, routeContent[type].responses['200']),
                            this.getResponseType(routeContent[type].responses['200'])
                        )
                    );
                });
                ms.apiDoc = routes;
                ms.associateChildren();
            });

            return ms;
        });
    }

    getJSONSchemaDefinition(api, defString) {
        const path: string[] = defString.split('/');
        let temp = api;
        for (let x = 1; x < path.length; x++) {
            temp = temp[path[x]];
        }
        return temp.properties;
    }
    prettify(obj) {
        function replacer(key, value) {
            if (isNullOrUndefined(value)) return undefined;
            else return value;
        }

        return JSON.stringify(obj, replacer, 4);
    }

    getResponseType(responseModel) {
        return responseModel && responseModel.schema
            ? responseModel.schema.type
                ? responseModel.schema.type
                : responseModel.schema.$ref ? responseModel.schema.$ref.substring('#/definitions/'.length) : null
            : null;
    }
    getJSONResponseType(ms, responseModel) {
        return responseModel && responseModel.schema
            ? responseModel.schema.$ref ? this.prettify(this.getJSONSchemaDefinition(ms, responseModel.schema.$ref)) : null
            : null;
    }

    getPrettifiedJSONApi(msApi, obj) {
        obj = obj.length === 1 ? obj[0] : obj;

        if (obj.constructor && obj.constructor.name == 'Array') {
            let arr = [];
            for (let param of obj) {
                let pretty = {};
                //get dto definition if exist
                if (param.schema && param.schema.$ref) {
                    const def = this.getJSONSchemaDefinition(msApi, param.schema.$ref);
                    pretty[param.name != null ? param.name : 'response'] = def;
                } else {
                    pretty[param.name] = isNullOrUndefined(param.format) ? param.type : param.format;
                }

                arr.push(pretty);
            }
            return this.prettify(arr);
        } else {
            if (obj.schema && obj.schema.$ref) {
                return this.prettify(this.getJSONSchemaDefinition(msApi, obj.schema.$ref));
            }
            return this.prettify(obj);
        }
    }
}
