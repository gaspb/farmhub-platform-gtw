import { Injectable } from '@angular/core';
import { CurrentComponentDTO } from './current-components.model';

@Injectable()
export class OpTemplateService {
    private btnIdx = 1;
    constructor() {}
    resetIdxes() {
        this.btnIdx = 1;
    }
    registerElement(el) {
        // this.templateHolder[el.type].push(el);
    }

    static mockRegisteredTpAndEvents = {};

    registerTpAndEvents(comp: CurrentComponentDTO) {
        console.log('registering tp and events : ', comp.templateComponents);
        if (comp.templateComponents) {
            for (let tpComp of comp.templateComponents) {
                if (tpComp.html) {
                    this.addTpandEvents(
                        tpComp['id'],
                        'output',
                        tpComp['html'],
                        tpComp['events']
                            ? JSON.parse(tpComp['events'].replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ').replace(/(')/g, '"'))
                            : []
                    );
                }
            }
        }
    }
    addTpandEvents(id, type, template, events) {
        console.log('addTpandEvents : ', arguments);
        OpTemplateService.mockRegisteredTpAndEvents[id] = {
            type: type,
            template: template,
            events: events
        };
    }
    getTemplateAndEvents(datatype, data, elementId) {
        let tpev = this.getMockTemplateAndEvents(datatype, data, elementId);
        if (!tpev) {
            //only output for now TODO
            tpev = this.getRegisteredTpAndEvents(datatype, data, elementId);
        }
        return tpev;
    }
    getRegisteredTpAndEvents(datatype, data, elementId) {
        let tpev =
            '<div id="' +
            elementId +
            '" class="op-tp ' +
            datatype +
            ' op-tp-output" data-tp-type="' +
            datatype +
            '" >' +
            OpTemplateService.mockRegisteredTpAndEvents[datatype].template +
            '<fa-icon class="connect-fa ng-fa-icon" data-op="connect" data-op-io="' +
            OpTemplateService.mockRegisteredTpAndEvents[datatype].type +
            '"  data-tp-type="' +
            datatype +
            '"><svg aria-hidden="true" class="svg-inline--fa fa-sitemap fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M128 352H32c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32zm-24-80h192v48h48v-48h192v48h48v-57.59c0-21.17-17.23-38.41-38.41-38.41H344v-64h40c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32H256c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h40v64H94.41C73.23 224 56 241.23 56 262.41V320h48v-48zm264 80h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32zm240 0h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32z"></path></svg></fa-icon>' +
            '<span class="tp-input-linked-op"></span>' +
            '</div>';
        return {
            element: null,
            template: tpev,
            events: OpTemplateService.mockRegisteredTpAndEvents[datatype].events
        };
    }
    getMockTemplateAndEvents(datatype, data, elementId) {
        console.log('DEBUG', datatype, data);
        let template = ''; //temp
        const events = [];
        let element;
        const body = data;
        switch (datatype) {
            case 'pipeline':
                template =
                    '<div id="' +
                    elementId +
                    '" class="op-tp op-tp-api"><div class="title">' +
                    data.pipelineId +
                    '</div>' +
                    '<div style="display:none"><span class="json-attribute ms-i-att">' +
                    data.inputJSONMinimalType +
                    '</span><span class="json-attribute ms-o-att"></span></div>' +
                    '<div class="ms-o o-op" data-op="connect"><span class="property">' +
                    'Reactive' +
                    '</span><span class="io">O</span></div>' +
                    '<div class="ms-i i-op" data-op="connect"><span class="property trigger">' +
                    '--trigger' +
                    '</span><span class="io">I</span></div></div>';

                break;
            case 'api':
                template =
                    '<div id="' +
                    elementId +
                    '" class="op-tp op-tp-api"><div class="title">' +
                    data.msDTO.path +
                    data.path +
                    ' :' +
                    data.reqType +
                    '</div>' +
                    '<div style="display:none"><span class="json-attribute ms-i-att">' +
                    data.inputJSONMinimalType +
                    '</span><span class="json-attribute ms-o-att"></span></div>' +
                    '<div class="ms-i i-op" data-op="connect"><span class="property ">' +
                    (body.inputType || data.inputDataType) +
                    '</span><span class="io">I</span></div>' +
                    '<div class="ms-o o-op" data-op="connect"><span class="property">' +
                    (body.outputType || data.outputDataType) +
                    '</span><span class="io">O</span></div></div>';

                break;
            case 'json-input':
                template =
                    '<div id="' +
                    elementId +
                    '" class="op-tp op-tp-holder"><div class="title" contenteditable="true" spellcheck="false" data-hjl-bind="title">' +
                    data.title +
                    '</div>' +
                    '<div class="ms-o o-op" data-op="connect"><span class="property">' +
                    'JSON' +
                    '</span><span class="io">O</span></div>' +
                    '<div class="ms-i i-op" data-op="connect"><span class="property trigger">' +
                    '--trigger' +
                    '</span><span class="io">I</span></div>' +
                    '<div class="more" data-op="more">+</div>' +
                    '<div class="content">' +
                    '<div><textarea class="tp-JSON-cont" spellcheck="false"></textarea></div>' +
                    '</div></div>';
                events.push('op-input-json');

                break;
            case 'javascript':
                template =
                    '<div id="' +
                    elementId +
                    '" class="op-tp op-tp-holder"><div class="title" contenteditable="true" spellcheck="false" data-hjl-bind="title">' +
                    data.title +
                    '</div>' +
                    '<div class="ms-o o-op" data-op="connect"><span class="property">' +
                    'any' +
                    '</span><span class="io">O</span></div>' +
                    '<div class="ms-i i-op" data-op="connect"><span class="property trigger">' +
                    'any' +
                    '</span><span class="io">I</span></div>' +
                    '<div class="more" data-op="more">+</div>' +
                    '<div class="content">' +
                    '<div>(data)=><textarea class="op-javascript-cont"></textarea></div>' +
                    '</div></div>';
                events.push('op-input-javascript');

                break;
            case 'holder':
                console.log(data);
                switch (data.type) {
                    case 'holder':
                        template =
                            '<div id="' +
                            elementId +
                            '" class="op-tp op-tp-holder"><div class="title" contenteditable="true" spellcheck="false" data-hjl-bind="title">' +
                            data.title +
                            '</div>' +
                            '<div class="ms-i i-op" data-op="connect"><span class="property">' +
                            '[ ] ' +
                            '</span><span class="io">I</span></div>' +
                            '<div class="ms-o o-op" data-op="connect"><span class="property">' +
                            '' +
                            '</span><span class="io">O</span></div>' +
                            '<div class="more" data-op="more">+</div>' +
                            '<div class="content">' +
                            '<div><span class="property">Inputs : </span>[<ul class="inputs" style="display: inline"><!-- spawn <li>s here --></ul>]</div>' +
                            '<div><span class="property">Output : </span><span class="output"></span></div>' +
                            '</div></div>';

                        break;

                    case 'divider': {
                        template =
                            '<div id="' +
                            elementId +
                            '" class="op-tp op-tp-holder"><div class="title" contenteditable="true" spellcheck="false"  data-hjl-bind="title">' +
                            data.title +
                            '</div>' +
                            '<div class="ms-i i-op" data-op="connect"><span class="property">' +
                            '' +
                            '</span><span class="io">I</span></div>' +
                            '<div class="ms-o o-op" data-op="connect"><span class="property">' +
                            '[ ] ' +
                            '</span><span class="io">O</span></div>' +
                            '<div class="more" data-op="more">+</div>' +
                            '<div class="content">' +
                            '<div><span class="property">Input : </span><span class="input"></span></div>' +
                            '<div><span class="property">Outputs : </span>[<ul class="outputs" style="display: inline"><!-- spawn <li>s here --></ul>]</div>' +
                            '</div></div>';

                        break;
                    }
                }

                events.push('op-input-pa');
                break;
            case 'converter':
                template =
                    '<div id="' +
                    elementId +
                    '" class="op-tp op-tp-converter"><div class="title" contenteditable="true" spellcheck="false">' +
                    data.title +
                    '</div>' +
                    '<div class="more" data-op="more">+</div>' +
                    '<div class="ms-o o-op" data-op="connect"><span class="io">O</span><span class="property"> : any[]</span></div>' +
                    '<div class="ms-i i-op" data-op="connect"><span class="io">I</span><span class="property"> : any[]</span></div>' +
                    '<div class="content">' +
                    '<div class="mapper"><span class="key" contenteditable="true" spellcheck="false"  data-hjl-map="key">key</span> : <span class="value" contenteditable="true" spellcheck="false"  data-hjl-map="value">value</span></div>' +
                    '</div></div>';
                events.push('op-input-pa');
                break;
            case 'operation':
                template =
                    '<div id="' +
                    elementId +
                    '" class="op-tp op-tp-operation"><div class="title">' +
                    data.operationName +
                    '</div>' +
                    '<div class="ms-i i-op" data-op="connect"><span class="property">' +
                    (data.input || data.inputDataType) +
                    '</span><span class="io">I</span></div>' +
                    '<div class="ms-o o-op" data-op="connect"><span class="property">' +
                    (data.output || data.outputDataType) +
                    '</span><span class="io">O</span></div></div>';
                break;
            case 'publicApi':
                let paramTemplate = data._params
                    ? Object.keys(data._params)
                          .map(
                              key =>
                                  '<span class="op-api-param" draggable="false" data-hjl-key="' +
                                  key +
                                  '">' +
                                  key +
                                  ' : <input type="text" value="' +
                                  data._params[key] +
                                  '" /></span>'
                          )
                          .join('')
                    : '';

                template =
                    '<div id="' +
                    elementId +
                    '" class="op-tp op-tp-public-api"><div class="title">' +
                    data.title +
                    '</div>' +
                    paramTemplate +
                    '<div class="ms-i i-op" data-op="connect"><span class="property">' +
                    (data.body.inputType || data.inputDataType) +
                    '</span><span class="io">I</span></div>' +
                    '<div class="ms-o o-op" data-op="connect"><span class="property">' +
                    (data.body.outputType || data.outputDataType) +
                    '</span><span class="io">O</span></div></div>';
                events.push('op-input-pa');
                break;
            case 'inputContainer':
                template =
                    '<div id="' +
                    elementId +
                    '" class="op-tp op-tp-inputContainer inputDropFile logic-container" >' +
                    '<div class="title io logic-container" dropzone="copy" data-op="connect">' +
                    'Drop your logic file !' +
                    '</div><div class="ms-i i-op" data-op="connect"><span class="property">' +
                    '--trigger</span><span class="io">I</span></div></div>';
                events.push('op-drop');
                break;

            /**
             * TEMPLATE
             */

            case 'tp-button':
                template =
                    '<div id="' +
                    elementId +
                    '" class="op-tp op-tp-button op-tp-input" >' +
                    '<button class="tp-input" contenteditable="true" spellcheck="false">' +
                    'Button 0' +
                    this.btnIdx++ +
                    '</button>' +
                    '<fa-icon class="connect-fa ng-fa-icon" data-op="connect" data-op-io="input"  data-tp-type="' +
                    datatype +
                    '"><svg aria-hidden="true" class="svg-inline--fa fa-sitemap fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M128 352H32c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32zm-24-80h192v48h48v-48h192v48h48v-57.59c0-21.17-17.23-38.41-38.41-38.41H344v-64h40c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32H256c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h40v64H94.41C73.23 224 56 241.23 56 262.41V320h48v-48zm264 80h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32zm240 0h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32z"></path></svg></fa-icon>' +
                    '<span class="tp-input-linked-op"></span>' +
                    '<span class="tp-input-linked-value" draggable="false">input : <input type="text" value="1"/></span>' +
                    '</div>';
                events.push('tp-input');
                events.push('fa-click');
                break;
            case 'tp-text':
                template =
                    '<div id="' +
                    elementId +
                    '" class="op-tp tp-text op-tp-input" >' +
                    '<textarea class="tp-input" placeholder="Enter input..."></textarea>' +
                    '<fa-icon class="connect-fa ng-fa-icon" data-op="connect" data-op-io="input"  data-tp-type="' +
                    datatype +
                    '"><svg aria-hidden="true" class="svg-inline--fa fa-sitemap fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M128 352H32c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32zm-24-80h192v48h48v-48h192v48h48v-57.59c0-21.17-17.23-38.41-38.41-38.41H344v-64h40c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32H256c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h40v64H94.41C73.23 224 56 241.23 56 262.41V320h48v-48zm264 80h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32zm240 0h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32z"></path></svg></fa-icon>' +
                    '<span class="tp-input-linked-op"></span>' +
                    '</div>';
                break;
            case 'tp-text-out':
                template =
                    '<div data-hjl-outtype="text" id="' +
                    elementId +
                    '" class="op-tp tp-text-out op-tp-output" >' +
                    '<textfield class="tp-output"></textfield>' +
                    '<fa-icon class="connect-fa ng-fa-icon" data-op="connect" data-op-io="output"  data-tp-type="' +
                    datatype +
                    '"><svg aria-hidden="true" class="svg-inline--fa fa-sitemap fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M128 352H32c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32zm-24-80h192v48h48v-48h192v48h48v-57.59c0-21.17-17.23-38.41-38.41-38.41H344v-64h40c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32H256c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h40v64H94.41C73.23 224 56 241.23 56 262.41V320h48v-48zm264 80h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32zm240 0h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32z"></path></svg></fa-icon>' +
                    '<span class="tp-input-linked-op"></span>' +
                    '<span class="tp-output-value"></span>' +
                    '</div>';
                break;
            case 'tp-log-out':
                template =
                    '<div data-hjl-outtype="log" id="' +
                    elementId +
                    '" class="op-tp tp-log-out op-tp-output" >' +
                    '<textfield class="tp-output"></textfield>' +
                    '<fa-icon class="connect-fa ng-fa-icon" data-op="connect" data-op-io="output"  data-tp-type="' +
                    datatype +
                    '"><svg aria-hidden="true" class="svg-inline--fa fa-sitemap fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M128 352H32c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32zm-24-80h192v48h48v-48h192v48h48v-57.59c0-21.17-17.23-38.41-38.41-38.41H344v-64h40c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32H256c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h40v64H94.41C73.23 224 56 241.23 56 262.41V320h48v-48zm264 80h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32zm240 0h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32z"></path></svg></fa-icon>' +
                    '<span class="tp-input-linked-op"></span>' +
                    '<span class="tp-output-value"></span>' +
                    '</div>';
                break;
            case 'tp-datatable-out':
                template =
                    '<div data-hjl-outtype="table" id="' +
                    elementId +
                    '" class="op-tp tp-datatable-out op-tp-output" data-tp-type="' +
                    datatype +
                    '" >' +
                    '<table class="tp-output"></table>' +
                    '</div>';
                break;
            case 'tp-graph-out':
                template =
                    '<div data-hjl-outtype="graph" id="' +
                    elementId +
                    '" class="op-tp tp-graph-out op-tp-output" data-graph-type="' +
                    data.graphType +
                    '" data-tp-type="' +
                    datatype +
                    '" >' +
                    '<div class="tp-output tp-graph"></div><div class="tp-graph-expand"></div>' +
                    '<div class="tp-options">' +
                    'Graph type : <select class="tp-select-graph">' +
                    '<option selected disabled></option>' +
                    '<option value="bar">Bar</option>' +
                    '<option value="line">Line</option>' +
                    '<option value="scatter">Scatter</option>' +
                    '<option value="radar">Radar</option>' +
                    '<option value="pie">Pie</option>' +
                    '</select>' +
                    '<div class="tp-options-2">' +
                    'Labels: <textarea class="graph-labels">{ }</textarea>' +
                    'Options : <textarea class="graph-options">{ }</textarea>' +
                    '</div>' +
                    '<div class="tp-options-3">' +
                    'Datasets : [<div class="graph-datasets">' +
                    '</div>] <button class="graph-add">+</button>' +
                    '<div><a href="https://www.chartjs.org/docs/latest/">ChartJS documentation</a></div>' +
                    '</div>' +
                    '</div>' +
                    '<fa-icon class="connect-fa ng-fa-icon" data-op="connect" data-op-io="output"  data-tp-type="' +
                    datatype +
                    '"><svg aria-hidden="true" class="svg-inline--fa fa-sitemap fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M128 352H32c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32zm-24-80h192v48h48v-48h192v48h48v-57.59c0-21.17-17.23-38.41-38.41-38.41H344v-64h40c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32H256c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h40v64H94.41C73.23 224 56 241.23 56 262.41V320h48v-48zm264 80h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32zm240 0h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32z"></path></svg></fa-icon>' +
                    '<span class="tp-input-linked-op"></span>' +
                    '</div>';
                events.push('tp-select-graph');
                break;
        }
        return template
            ? {
                  element: element,
                  template: template,
                  events: events
              }
            : null;
    }
}
