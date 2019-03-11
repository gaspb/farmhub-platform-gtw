import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';
import { DragNDropDirective } from './dragndrop.directive';
import { OpTemplateService } from './op-templates.service';
import { PlaygroundService } from './playground.service';
import { Observable } from 'rxjs/Observable';
import { OperationLogicService } from './operation-logic.service';
import { downloadAsFile } from '../shared/util/file-util';
import { Subscription } from 'rxjs/Rx';
import { Chart } from 'chart.js';
import { isNullOrUndefined } from 'util';
import { DashboardService } from '../dashboard/dashboard.service';

@Component({
    selector: 'operation-view',
    template: `
              <div [ngClass]="{'testMode': testMode}" class="drop-container"><div id="op-bin-{{instanceId}}" *ngIf="(isDraggedOver && draggedItem==null)"  ><i class="fa fa-trash op-trash" aria-hidden="true" (dragover)="dragOver('trash')" (dragleave)="isTrashDraggedOver=false"></i></div>
                  <div  class="top-container" [ngClass]="isTrashActive ? 'trash-active' : ''">
                          <span class="topMenu"><span [ngClass]="saveBtn==='Save' ? 'save' : ('saved'+ (isOp?'-op':'-tp'))" (click)="save()">{{saveBtn}}</span><span class="new" (click)="empty()">New</span><span class="load" (click)="load()">Load</span><span [ngClass]="{'test' : testMode} " class="try" (click)="isOp ? runOpLogic() : testTemplate()">{{isOp ? 'Run' : testMode ? 'TEST MODE' : 'Test'}}</span><span (click)="downloadJSON()"><fa-icon [icon]="'download'"></fa-icon></span>
                              </span><span class="op-trash-right trash" (click)="isTrashActive = !isTrashActive"><fa-icon [icon]="'trash-alt'"></fa-icon></span>
                      <div class="op-desc-cont"><h3 contenteditable="true" spellcheck="false" class="pg-title" (blur)="cpName = $event.srcElement.textContent; saveBtn = 'Save'">{{cpName}}</h3>
                      <!--<div class="op-desc-value" draggable="false">Desc : <textarea class="op-desc" spellcheck="false"></textarea></div>--></div>
                  </div>
                  <div class="op-display" [ngClass]="displayContent!=null ? 'open' : ''">
                      <span style="font-weight:500">Output</span>                  
                      <textarea disabled>{{displayContent}}</textarea>
                      <button (click)="displayContent=null;cancel()">Close</button>
                  </div>
<div id="op-content-{{instanceId}}" class="op-content"  (dragleave)="isDraggedOver=false" (drop)="isDraggedOver=false" (dragover)="dragOver()" [ngClass]="{ 'dragtome': isDraggedOver==true, 'testMode' : testMode}">
    <div class="op-overlay" (click)="hideOverlay($event)"></div>
</div>
                  <div class="i-o-bar" *ngIf="isOp" > <div id="o-op-0" class="o-op io-op-main" ><span class="io pointer"  data-op="connect">I</span></div>
                      <div id="i-op-0" class="i-op io-op-main"  ><span class="io pointer"  data-op="connect">O</span></div></div>
              </div>`
})
export class OperationComponent implements OnDestroy {
    isDraggedOver: boolean;
    displayContent /*: Observable<string> = null*/;
    isTrashDraggedOver: boolean;
    isTrashActive: boolean;
    instanceId: any;
    opId = 1;
    saveBtn = 'Save';
    testMode = false;
    charts = {};
    static instances = {};
    static uniqueId = 0;
    static componentIndex;
    //used to store displayed components for db saving
    static jsonTemplate = {
        inputs: {},
        outputs: {}
    };
    static opJsonCache = {};
    static jsonOperation = {};
    tp = OperationComponent.jsonTemplate;

    @Output() toggleOpMenu: EventEmitter<any> = new EventEmitter<any>();
    @Output() updateVar: EventEmitter<any> = new EventEmitter<any>();

    @Input('draggedItem') draggedItem: any;

    @Input('opView') isOp: boolean;

    cpName: string;
    isOpTxt = {
        op: {
            baseName: 'Operation'
        },
        tp: {
            baseName: 'Template'
        }
    };

    constructor(
        private elRef: ElementRef,
        private optpService: OpTemplateService,
        private pgService: PlaygroundService,
        private opLogicService: OperationLogicService,
        private dashboardService: DashboardService
    ) {
        if (OperationComponent.componentIndex === undefined) {
            OperationComponent.componentIndex = 0;
        }
        this.instanceId = OperationComponent.componentIndex++;

        setTimeout(() => {
            this.cpName = this.isOp ? 'Operation 01' : 'Template 01';
            OperationComponent.instances[this.isOp ? 'op' : 'tp'] = this;
        }, 20);
    }

    public text(str) {
        return this.isOp ? this.isOpTxt['op'][str] : this.isOpTxt['tp'][str];
    }

    public downloadJSON() {
        downloadAsFile(this.getLogic(), this.cpName + '.json', 'application/json');
    }
    public uploadJSON() {}

    //save btn
    public save(externalData?) {
        console.log('savebutton pressed');
        (document.activeElement as HTMLElement).blur();
        if (this.isOp) {
            this.pgService
                .saveOperation(externalData ? externalData.name : this.cpName, externalData ? externalData.body : this.getLogic())
                .subscribe(
                    data => {
                        console.log('Saved op ! ', data);
                        if (data == true) {
                            this.saveBtn = 'Saved !';
                        }
                        //update OPes
                        const test = this.pgService.getOperationList().subscribe(
                            data => {
                                console.log('EMIT ---- GET OPS ', data);
                                this.updateVar.emit({
                                    name: 'OPes',
                                    value: data
                                });
                            },
                            error => {
                                console.log('ERROR', error);
                            }
                        );
                    },
                    error => {
                        console.error('Error saving op !');
                        return Observable.throw(error);
                    }
                );
        } else {
            this.pgService.saveFullSessionTemplate(OperationComponent.jsonTemplate, OperationComponent.jsonOperation).subscribe(
                data => {
                    console.log('Saved tp ! ', data);
                    if (data == true) {
                        this.saveBtn = 'Saved !';
                    }
                    return true;
                },
                error => {
                    console.error('Error saving op !');
                    return Observable.throw(error);
                }
            );
        }
    }

    //save along the use
    public saveLogic(type, item, id, additivity?) {
        let arr = OperationComponent[this.isOp ? 'jsonOperation' : 'jsonTemplate'][type];
        if (arr == undefined) {
            arr = {};
        }
        if (!additivity) {
            arr[id] = item == null ? { status: 'init' } : item;
        } else {
            arr[id] == null ? (arr[id] = [item]) : arr[id].push(item);
        }

        console.log('saving ', arr, this.getLogic());
        this.getLogic()[type] = arr;
        this.saveBtn = 'Save';
    }

    public retrieveLogic(type) {
        return this.getLogic()[type];
    }
    public getLogic() {
        return OperationComponent[this.isOp ? 'jsonOperation' : 'jsonTemplate'];
    }
    public resetLinks() {
        this.getLogic()['links'] = {};
    }
    public resetLogic(both?) {
        OperationComponent[this.isOp ? 'jsonOperation' : 'jsonTemplate'] = {};
        if (both) {
            OperationComponent[this.isOp ? 'jsonTemplate' : 'jsonOperation'] = {};
        }
    }
    /* public displayOpResult(result) {
        this.displayContent = JSON.stringify(result, null, 4);
    }*/

    /**
     * START RUN OP
     */

    public cancel() {
        if (this.obs) {
            this.subscription.unsubscribe();
            this.opLogicService.unsubscribeAll();
        }
    }
    obs: Observable;
    subscription: Subscription;
    public async runOpLogic() {
        //TODO remove input prompt when no input, and adapt it to json/websocket/document etc

        //TODO : choose subscribe or runOnce
        //TODO As this page allows testing, one time is enough. Go to template to see reactive outputs

        this.obs = this.opLogicService.runOpLogic(this.getLogic(), prompt('input ?'));
        console.log('RECEIVED OBS IN RUNOPLOGIC', this.obs);

        const self = this;
        this.subscription = this.obs.subscribe(prom => {
            console.log('prom:', prom);
            if (prom instanceof Promise) {
                prom.then(data => (self.displayContent = JSON.stringify(data, null, 4)));
            } else {
                self.displayContent = JSON.stringify(prom, null, 4);
            }
        });

        /*  let subscribe = this.opLogicService.runOpLogic(this.getLogic(), prompt('input ?')).subscribe(data => {
            console.log("Subscribable returned data :", data);
            this.displayContent =  JSON.stringify(data, null, 4)
        });*/
    }

    public parseOrEmpty(any) {
        if (!any || any.toString().trim().length === 0) {
            return {};
        }
        let result = null;
        try {
            result = JSON.parse(any.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ').replace(/(')/g, '"'));
        } catch (e) {
            result = {};
        }
        return result;
    }

    listenedTemplateElems = [];
    public async testTemplate() {
        if (this.testMode) {
            this.testMode = false;
            await this.listenedTemplateElems.map(elem => elem[0].removeEventListener('click', elem[1]));
            this.listenedTemplateElems = [];
            this.opLogicService.unsubscribeAll();
            return;
        }
        this.testMode = true;
        //TODO filter out unconnected elems or duplicates

        const inputs = ['tp-button', 'tp-text'];
        const outputs = this.dashboardService.currentDTO
            ? this.dashboardService.currentDTO.components.templateComponents.map(s => s.id)
            : this.pgService.getMockTemplateOutputs().map(s => s.id);
        //get all Ids
        const logic = this.getLogic();
        let operations = {};
        const self = this;
        console.log('D0', logic);
        Object.keys(logic).map(key =>
            Object.keys(logic[key]).map(id => {
                let _op = logic[key][id]['op'];
                if (!_op) {
                    console.log("Element isn't linked to an op : " + id);
                } else {
                    if (!operations[_op['operationName']]) {
                        operations[_op['operationName']] = {};
                    }
                    operations[_op['operationName']][inputs.indexOf(key) >= 0 ? 'IN' : outputs.indexOf(key) >= 0 ? 'OUT' : 'UNRESOLVED'] = {
                        id: id,
                        body: logic[key][id]._value
                    };
                }
            })
        );
        console.log('D1', operations);
        Object.keys(operations).map(op => {
            const input = operations[op]['IN'];
            const output = operations[op]['OUT'];
            console.log('D2', op, output, input, operations);
            let hasInit = false;
            function _tpButtonClickHandler() {
                let inputVal = input.body;
                let obs = self.opLogicService.asObservable(self.opLogicService.execute('operation', inputVal, { operationName: op }));
                if (!output) {
                    obs.subscribe(data => {
                        console.log("No output connected to input, result can't be displayed", data);
                    });
                    return true;
                }
                let div = document.getElementById(output.id);

                if (self.charts) {
                    console.log('destroying chart');
                    if (self.charts[output.id]) {
                        self.charts[output.id].destroy();
                        self.charts[output.id] = null;
                        div.getElementsByClassName('tp-output')[0].innerHTML = '';
                    }
                }
                let offsetMillis = performance.now();
                //TODO INIT
                if (!div.getAttribute('data-hjl-outtype') && !hasInit) {
                    console.log('INIT', output);

                    let outId = output.id.substring(5, output.id.lastIndexOf('-'));
                    let outputDiv = (self.dashboardService.currentDTO
                        ? self.dashboardService.currentDTO.components.templateComponents
                        : self.pgService.getMockTemplateOutputs()
                    ).filter(s => s['id'] == outId)[0];
                    let deps = outputDiv.dependencies.split(',');
                    console.log('downloading dependencies', deps);
                    let pgContainer = document.getElementsByClassName('pg-container')[0];
                    if (deps.length > 0) {
                        deps.forEach(dep => {
                            let str: string = '[data-loaded-dep="' + dep.trim() + '"]';
                            if (pgContainer.querySelector(str)) {
                                console.log('dependency already loaded ', dep);
                            } else {
                                try {
                                    console.log('dep:', dep);
                                    let req = new XMLHttpRequest();
                                    req.open('get', dep, false);
                                    req.send();

                                    let c = req.response;
                                    let script = document.createElement('script');
                                    script.innerHTML = c;
                                    script.setAttribute('data-loaded-dep', dep);
                                    pgContainer.appendChild(script);
                                    console.log('dep loaded', dep, str);
                                } catch (e) {
                                    console.log('Error evaluating dependency : ', e);
                                }
                            }
                        });
                    }

                    try {
                        console.log('running initjs', '(body)=>{' + outputDiv['initjs'] + '}');

                        let func = eval('(body)=>{' + outputDiv['initjs'] + '}');
                        func(output.body);
                    } catch (e) {
                        console.log('Error evaluating init func : ', e);
                    }
                    hasInit = true;
                }
                //TODO ONDESTROY
                let subscriber = obs.subscribe(data => {
                    console.log('=====_____DATA--', data);
                    //TODO UPDATE
                    if (!div.getAttribute('data-hjl-outtype')) {
                        console.log('UPDATE', data, output);
                        let outId = output.id.substring(5, output.id.lastIndexOf('-'));
                        let outputDiv = (self.dashboardService.currentDTO
                            ? self.dashboardService.currentDTO.components.templateComponents
                            : self.pgService.getMockTemplateOutputs()
                        ).filter(s => s['id'] == outId)[0];

                        try {
                            console.log('Evaluating update func : ', ['(data, body)=>{' + outputDiv['updatejs'] + '}']);
                            let func = eval('(data, body)=>{' + outputDiv['updatejs'] + '}');
                            func(data, output.body);
                        } catch (e) {
                            console.log('Error evaluating update func : ', e);
                        }
                        return;
                    }
                    switch (div.getAttribute('data-hjl-outtype')) {
                        case 'text':
                            div.getElementsByClassName('tp-output-value')[0].textContent = data;
                            break;
                        case 'log':
                            div.getElementsByClassName('tp-output-value')[0].innerHTML += '<br/>' + data;
                            break;
                        case 'datatable':
                            break;
                        case 'graph':
                            if (!self.charts) {
                                self.charts = {};
                            }
                            console.log('Chart Options --before: ' + output.id, logic['tp-graph-out'][output.id]);
                            if (!self.charts[output.id]) {
                                const canvas = document.createElement('canvas');
                                const container = div.getElementsByClassName('tp-output')[0].appendChild(canvas);
                                const ctx = canvas.getContext('2d');
                                let body = logic['tp-graph-out'][output.id].body || logic['tp-graph-out'][output.id]._value;
                                console.log('Body', body);
                                let dataSets = body.datasets.map(ds => self.parseOrEmpty(ds));
                                console.log('BodyJSON', dataSets);
                                let dsLength = dataSets ? dataSets.length : 0;
                                let labelsAndDatasets: { datasets; labels } = self.getLabelsAndDatasets(data, body.graphType);
                                let tempDatasets = [];
                                for (let i = 0; i < labelsAndDatasets.datasets.length; i++) {
                                    let recievedDataset = labelsAndDatasets.datasets[i];
                                    let userDataset = dsLength >= i ? dataSets[i] : null;
                                    console.log('userDataset', userDataset);
                                    if (recievedDataset.label) {
                                        if (recievedDataset.label != userDataset.label) {
                                            console.log(
                                                'Warning - recieved dataset label is ' +
                                                    recievedDataset.label +
                                                    ' while configured label is ' +
                                                    userDataset.label
                                            );
                                        } else {
                                            userDataset.label = recievedDataset.label;
                                        }
                                    }
                                    userDataset.data = recievedDataset.data;
                                    labelsAndDatasets.datasets[i] = userDataset;
                                }
                                if (!labelsAndDatasets.labels) {
                                    if (body.labels) {
                                        labelsAndDatasets.labels = body.labels;
                                    } else {
                                        labelsAndDatasets.labels = [];
                                    }
                                }

                                console.log('Datasets', labelsAndDatasets, labelsAndDatasets.datasets[0]);
                                let chartOptions = {
                                    type: body.graphType,
                                    data: {
                                        labels: labelsAndDatasets.labels,
                                        datasets: labelsAndDatasets.datasets
                                    },
                                    options: self.parseOrEmpty(body.options)
                                };

                                console.log('Chart Options : ', chartOptions);
                                self.charts[output.id] = new Chart(ctx, chartOptions);
                            } else {
                                console.log('Chart already exists', self.charts[output.id], self.charts[output.id].data);
                                //TODO update labels number if necessary
                                if (!self.charts[output.id].data.datasets[0].data || !self.charts[output.id].data.datasets[0].data.push) {
                                    self.charts[output.id].data.datasets[0].data = [];
                                }

                                let labelsAndDatasets = self.getLabelsAndDatasets(data, self.charts[output.id].config.type);

                                //either add new values tu the dataset
                                if (self.charts[output.id].config.type === 'scatter' || self.charts[output.id].config.type === 'line') {
                                    console.log('Chart is scatter or line, adding data');
                                    if (labelsAndDatasets.labels) {
                                        self.charts[output.id].data.labels.push(labelsAndDatasets.labels);
                                    }
                                    //self.charts[output.id].data.push(data);//==add new datasets
                                    //==update existing datasets or add new
                                    const oldDataLength = self.charts[output.id].data.datasets.length;
                                    for (let x = 0; x < labelsAndDatasets.datasets.length; x++) {
                                        if (oldDataLength >= x) {
                                            for (let y = 0; y < labelsAndDatasets.datasets[x].data.length; y++) {
                                                self.charts[output.id].data.datasets[x].data.push(labelsAndDatasets.datasets[x].data[x]);
                                            }
                                        } else {
                                            self.charts[output.id].data.datasets.push(labelsAndDatasets.datasets[x]);
                                        }
                                    }
                                    /*
                                    if(Array.isArray(data.data)) {
                                        data.forEach(s=>self.charts[output.id].data.datasets[0].data.push(s));
                                        self.charts[output.id].data.labels.push(dataOffset++)
                                    } else {
                                        self.charts[output.id].data.datasets.push(data);
                                    }*/
                                } else {
                                    // or update values TODO update some
                                    console.log('Setting new data to the chart', labelsAndDatasets.datasets);

                                    if (performance.now() - offsetMillis < 400) {
                                        console.log('SLOW DOWN BUDDY');
                                        return;
                                    }
                                    offsetMillis = performance.now();
                                    if (labelsAndDatasets.labels) {
                                        self.charts[output.id].data.labels = labelsAndDatasets.labels;
                                    }
                                    if (labelsAndDatasets.datasets && labelsAndDatasets.datasets.length > 0) {
                                        const oldDatasetsLgth = self.charts[output.id].data.datasets.length;
                                        for (let x = 0; x < labelsAndDatasets.datasets.length; x++) {
                                            if (oldDatasetsLgth >= x) {
                                                console.log('updating data', self.charts[output.id].data.datasets[x].data);
                                                self.charts[output.id].data.datasets[x].data = labelsAndDatasets.datasets[x].data;
                                            } else {
                                                console.log('is new dataset');
                                                self.charts[output.id].data.datasets[x] = labelsAndDatasets.datasets[x];
                                            }
                                        }
                                    }
                                }

                                self.charts[output.id].update();
                            }
                            console.log('CHARTS', self.charts);
                            break;
                    }

                    //.textContent = data;
                });
            }

            //temp => TODO try not tu use document.getElementById but create actual divs in another layer and attach drectly events to them (so they are destroyed on test end)
            if (!input) {
                console.log('error testing - no input defined');
            } else {
                const elem = document.getElementById(input.id);
                elem.addEventListener('click', _tpButtonClickHandler);
                this.listenedTemplateElems.push([elem, _tpButtonClickHandler]);
            }
        });
    }

    public restoreOpFromJSON() {
        //1:check op consistency : verify it's a closed circuit, always from input to output
        //convert the coordinates to absolute position. if duplicate coordinate, stack in a var and place after all the rest in a free spot
        //place the elements
        //draw the links
    }

    /**
     *      DROP
     */

    @HostListener('drop', ['$event'])
    public onDrop(event: DragEvent) {
        if (this.testMode) {
            return;
        }
        console.log(event, event.dataTransfer.files[0]);
        if (event.srcElement.classList.contains('logic-container') && event.dataTransfer.files.length == 1) {
            event.preventDefault();
            let self = this;
            let file = event.dataTransfer.files[0],
                reader = new FileReader();
            reader.onload = function(ev) {
                console.log(ev.target);
                self.save({ name: file.name, body: JSON.parse(ev.target['result']) });
            };
            reader.readAsText(file);

            return;
        }

        console.log('TRASH ', this.draggedItem, this.draggedItem === null);
        event.preventDefault();
        event.stopPropagation();
        // PlaygroundComponent.drop(event);
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        const isMove = data.isMove;
        let div;
        const opcontent = document.getElementById('op-content-' + this.instanceId);
        console.log('DATA0', data);
        if (isMove) {
            console.log('DATA', data);
            div = document.getElementById(data.target).parentElement;
            div.style.left = opcontent.offsetLeft - 80 + event.clientX + 'px';
            div.style.top = -opcontent.offsetTop * 5 + event.clientY + 'px';

            let idToCheck = div.children[0].id;
            let links = this.retrieveLogic('link') || {};
            console.log('LINKS ', links);
            let linksAsInput = links[idToCheck] || [];
            this.resetLinks();
            console.log('LINKS INPUT ', linksAsInput, linksAsInput.length);
            let linksAsOutput = Object.getOwnPropertyNames(links)
                .map(name => {
                    links[name][0].origin = name;
                    return links[name][0];
                })
                .filter(link => link.target === idToCheck);
            linksAsOutput.forEach(link => (link.isOutput = true));
            console.log('LINKS OUTPUT ', linksAsOutput);
            let allLinks = linksAsInput.concat(linksAsOutput);
            if (allLinks != null && allLinks.length > 0) {
                allLinks.forEach(function(elem) {
                    console.log('INITOP ', div, div.querySelectorAll(elem.isOutput ? '.o-op' : '.i-op')[0]);
                    document.getElementById(elem.lineId).remove();
                    DragNDropDirective.resetOpConnection();
                    DragNDropDirective.initOpConnection(div.querySelectorAll(elem.isOutput ? '.o-op' : '.i-op')[0]);
                    const target = document.getElementById(elem.isOutput ? elem.origin : elem.target);
                    const io = target.className == 'io' || target.classList.contains('io-op-main');
                    console.log('IINI OP2', target, io, elem);
                    let ret = DragNDropDirective.initOpConnection(
                        io ? target : target.querySelectorAll(elem.isOutput ? '.i-op' : '.o-op')[0]
                    );
                    elem.lineId = ret[2];
                    /*                    links[elem.target] ? links[elem.target]
                        .filter(link => link.target===idToCheck)
                        .map(link =>link.lineId = elem.lineId):null;*/
                });
            }
        } else {
            const elementId = (this.isOp ? 'c_op-' : 'c_tp-') + data.type + '-' + OperationComponent.uniqueId++;
            this.optpService.registerElement(this.draggedItem);
            console.log('ADDING ITEM ', this.draggedItem);
            const tpAndEvHolder = this.optpService.getTemplateAndEvents(data.type, this.draggedItem, elementId);
            const template = tpAndEvHolder.template;
            const events = tpAndEvHolder.events;
            this.saveLogic(data.type, this.draggedItem, elementId);
            // const element = tpAndEvHolder.element;
            if (template == null) {
                return false;
            }
            div = document.createElement('div');

            div.classList.add('child');
            div.draggable = true;
            div.style.position = 'absolute';
            div.innerHTML = template;
            div.style.left = opcontent.offsetLeft - 70 + event.clientX + 'px';
            div.style.top = -opcontent.offsetTop * 5 + event.clientY + 'px';
            opcontent.appendChild(div);
            console.log('ADDED DIV --------', div, tpAndEvHolder);
            div.addEventListener('dragstart', function(e) {
                console.log('dragstart-----------', e, this.children[0].id);
                (e as DragEvent).dataTransfer.setData(
                    'Text',
                    JSON.stringify({ type: data.type, isMove: true, target: this.children[0].id })
                );
                console.log('ISMOVE DRAG ', e, this.draggedItem);
            });

            if (events && events.length > 0) {
                const self = this;

                if (events[0].constructor.name === 'Object') {
                    console.log('CUSTOM OUTPUT', div, events);
                    let optpdiv = div.querySelector('.op-tp');
                    //END MOCK
                    events.forEach((ev: { type; target; bound; callback? }) => {
                        div.querySelector(ev.target).addEventListener(ev.type, function($event) {
                            if (ev.bound) {
                                if (!self.getLogic()[optpdiv.getAttribute('data-tp-type')]) {
                                    self.getLogic()[optpdiv.getAttribute('data-tp-type')] = {};
                                }
                                if (!self.getLogic()[optpdiv.getAttribute('data-tp-type')][optpdiv.id]) {
                                    self.getLogic()[optpdiv.getAttribute('data-tp-type')][optpdiv.id] = {};
                                }
                                if (!self.getLogic()[optpdiv.getAttribute('data-tp-type')][optpdiv.id]['_value']) {
                                    self.getLogic()[optpdiv.getAttribute('data-tp-type')][optpdiv.id]['_value'] = {};
                                }
                                self.getLogic()[optpdiv.getAttribute('data-tp-type')][optpdiv.id]['_value'][ev.bound] = $event.srcElement
                                    .value
                                    ? $event.srcElement.value
                                    : $event.srcElement.textContent.trim();
                            }

                            if (ev.callback) {
                                eval(ev.callback); //TODO !!!
                            }
                        });
                    });
                } else {
                    //START MOCK
                    events.forEach(function(e) {
                        switch (e) {
                            //OPERATION VIEW
                            case 'op-input-pa':
                                div.addEventListener('input', function(e) {
                                    console.log('input : ', e);
                                    //SAVELOGIC TODO
                                    //API
                                    let key = e.srcElement.parentElement.getAttribute('data-hjl-key');
                                    let id = e.srcElement.parentElement.parentElement.id;
                                    if (!self.getLogic()['publicApi'][id]['_params']) {
                                        self.getLogic()['publicApi'][id]['_params'] = {};
                                    }
                                    self.getLogic()['publicApi'][id]['_params'][key] = e.srcElement.value;
                                });
                                break;
                            case 'op-input-json':
                                div.querySelector('.tp-JSON-cont').addEventListener('input', function(e) {
                                    console.log('input : ', e);
                                    let id = div.querySelector('.op-tp').id;
                                    self.getLogic()['json-input'][id]['content'] = e.srcElement.value;
                                });
                                break;
                            case 'op-input-javascript':
                                div.querySelector('.op-javascript-cont').addEventListener('input', function(e) {
                                    console.log('input : ', e);
                                    let id = div.querySelector('.op-tp').id;
                                    self.getLogic()['javascript'][id]['content'] = e.srcElement.value;
                                });
                                break;

                            //TEMPLATE VIEW
                            case 'tp-input':
                                div.addEventListener('input', function(e) {
                                    console.log('input : ', e);
                                    //SAVELOGIC TODO
                                    //BUTTON
                                    let id = DragNDropDirective.closest(e.srcElement, ['op-tp'], 6).id;
                                    self.getLogic()['tp-button'][id]['_value'] = e.srcElement.value;
                                });
                                break;
                            case 'fa-click':
                                //  div.querySelector('fa-icon').addEventListener('click', function(ev){ev.stopPropagation()});
                                break;
                            case 'tp-select-graph':
                                div.getElementsByClassName('graph-options')[0].addEventListener('input', function(e) {
                                    let id = DragNDropDirective.closest(e.srcElement, ['op-tp'], 6).id;
                                    console.log('opt input : ' + id, e.srcElement.value);
                                    if (!self.getLogic()['tp-graph-out'][id]['_value']) {
                                        self.getLogic()['tp-graph-out'][id]['_value'] = {};
                                    }
                                    self.getLogic()['tp-graph-out'][id]['_value']['options'] = e.srcElement.value;
                                });
                                div.getElementsByClassName('graph-labels')[0].addEventListener('input', function(e) {
                                    let id = DragNDropDirective.closest(e.srcElement, ['op-tp'], 6).id;
                                    console.log('input : ' + id, e.srcElement.value);
                                    if (!self.getLogic()['tp-graph-out'][id]['_value']) {
                                        self.getLogic()['tp-graph-out'][id]['_value'] = {};
                                    }
                                    self.getLogic()['tp-graph-out'][id]['_value']['labels'] = e.srcElement.value.split(',');
                                });
                                div.getElementsByClassName('graph-add')[0].addEventListener('click', function(e) {
                                    let textarea = document.createElement('textarea');
                                    let id = DragNDropDirective.closest(e.srcElement, ['op-tp'], 6).id;
                                    if (!self.getLogic()['tp-graph-out'][id]['_value']) {
                                        self.getLogic()['tp-graph-out'][id]['_value'] = {};
                                    }
                                    if (!self.getLogic()['tp-graph-out'][id]['_value']['datasets']) {
                                        self.getLogic()['tp-graph-out'][id]['_value']['datasets'] = [];
                                    }
                                    let idx = self.getLogic()['tp-graph-out'][id]['_value']['datasets'].length;
                                    self.getLogic()['tp-graph-out'][id]['_value']['datasets'].push('{}');
                                    textarea.addEventListener('input', function(e) {
                                        self.getLogic()['tp-graph-out'][id]['_value']['datasets'][idx] = e.srcElement.value;
                                    });
                                    div.getElementsByClassName('graph-datasets')[0].appendChild(textarea);
                                });
                                div.getElementsByClassName('graph-add')[0].click();
                                div.getElementsByClassName('tp-select-graph')[0].addEventListener('change', function(e) {
                                    let id = DragNDropDirective.closest(e.srcElement, ['op-tp'], 6).id;
                                    console.log('change : ' + id, e.srcElement.value);
                                    if (!self.getLogic()['tp-graph-out'][id]['_value']) {
                                        self.getLogic()['tp-graph-out'][id]['_value'] = {};
                                    }
                                    self.getLogic()['tp-graph-out'][id]['_value']['graphType'] = e.srcElement.value;
                                });
                                break;
                        }
                    });
                }
            }
        }

        return false;
    }

    removeItemIfChild(item) {
        let div = item.className != 'child' ? DragNDropDirective.closest(item, ['child'], 7) : item;
        if (div == null) {
            return false;
        }
        if (!this.isOp) {
            let id = div.querySelector('.op-tp').id;
            let logic = this.getLogic();
            let keys = Object.keys(logic);
            keys.forEach(key => {
                if (logic[key][id]) {
                    delete logic[key][id];
                    if (Object.keys(logic[key]).length == 0) {
                        delete logic[key];
                    }
                }
            });
            div.remove();
        } else {
            //TODO remove link item
            let id = div.querySelector('.op-tp').id;
            let type = id.substring(id.indexOf('-') + 1, id.lastIndexOf('-'));
            let logic = this.getLogic();
            delete logic[type][id];
            if (logic['link']) {
                Object.keys(logic['link'])
                    .filter(key => key == id)
                    .forEach(key => {
                        logic['link'][key].forEach(link => document.getElementById(link.lineId).remove());

                        delete logic['link'][key];
                    });
                Object.keys(logic['link']).forEach(key =>
                    logic['link'][key].filter(link => link.target == id).forEach(link => {
                        document.getElementById(link.lineId).remove();
                        //remove link from array
                        if (logic['link'][key].length == 1) {
                            delete logic['link'][key];
                        } else {
                            logic['link'][key].splice(logic['link'][key].indexOf(link), 1);
                        }
                    })
                );
            }
            div.remove();
        }

        return true;
    }

    @HostListener('click', ['$event'])
    click(ev: Event) {
        if (this.testMode) {
            return;
        }
        if (this.isTrashActive) {
            let found: boolean = this.removeItemIfChild(ev.srcElement); //return ?
            if (found) {
                return;
            }
        }
        let elem = ev.srcElement;
        if (elem.parentElement.getAttribute('data-op')) {
            elem = elem.parentElement;
        } else if (elem.parentElement.parentElement.getAttribute('data-op')) {
            elem = elem.parentElement.parentElement;
        }

        const type: string = elem.getAttribute('data-op') || (elem.className === 'io' ? 'connect' : '');
        console.log(elem, type);
        if (type != null && type.length > 0) {
            switch (type) {
                case 'more':
                    DragNDropDirective.showMore(elem.parentElement);
                    break;
                case 'connect':
                    if (this.isOp) {
                        const arr = DragNDropDirective.initOpConnection(ev.target);
                        console.log('connect OP', arr);
                        if (arr && arr.length == 3) {
                            this.saveLogic('link', { target: arr[1], lineId: arr[2] }, arr[0], true);

                            for (let i of [0, 1]) {
                                if (arr[i].indexOf('json-input') >= 0 && arr[i == 0 ? 1 : 0] != 'o-op-0') {
                                    document
                                        .getElementById(arr[i])
                                        .querySelector('textarea.tp-JSON-cont').innerHTML = document
                                        .getElementById(arr[i == 0 ? 1 : 0])
                                        .querySelector('.ms-i-att.json-attribute').textContent;
                                    break;
                                }
                            }
                        }
                    } else {
                        console.log('connect TP', ev.target);
                        this.toggleOpMenu.emit({
                            toggleOpMenu: 'tp-opp',
                            ioType: elem.getAttribute('data-op-io')
                        });
                        elem.classList.contains('tp-connect-active')
                            ? elem.classList.remove('tp-connect-active')
                            : elem.classList.add('tp-connect-active');
                        const obj = DragNDropDirective.initTpConnection(elem, 'tp');
                        if (obj != null) {
                            this.toggleOpMenu.emit({
                                toggleOpMenu: '',
                                ioType: ''
                            });
                            obj.tpItem.classList.remove('tp-connect-active');
                            console.log('SAVE LOGIC ');
                            let tp = this.getLogic[obj.tpItem.getAttribute('data-tp-type')][obj.tpItem.parentElement.id] || {};
                            tp.op = obj.op;
                            tp.io = obj.tpItem.dataset.io;
                            this.getLogic[obj.tpItem.getAttribute('data-tp-type')][obj.tpItem.parentElement.id] = tp;
                        } else {
                            this.saveBtn = 'Save';
                        }
                        return false;
                    }
            }
        }
    }
    ngOnDestroy() {
        this.optpService.resetIdxes();
        this.resetLogic(true);
        this.opLogicService.unsubscribeAll();
    }
    dragOver(opt) {
        event.preventDefault();
        if (!opt) this.isDraggedOver = true;
        if (opt === 'trash') {
            console.log('DRAGGING OVER TRASH');
            this.isTrashDraggedOver = true;
        }
    }
    dragStart() {}
    empty() {
        const children = document.body.getElementsByClassName('op-content')[this.isOp ? 0 : 1].children;
        while (children.length > 1) {
            children[1].remove();
        }
        children[0].classList.remove('open');
        this.resetLogic();
        this.cpName = (this.isOp ? 'Operation ' : 'Template ') + '0' + this.opId++;
        this.saveBtn = 'Save';
    }
    hideOverlay(event) {
        event.target.classList.remove('open');
        const currentDiv = document.body.getElementsByClassName('op-overoverlay')[0];
        currentDiv.classList.remove('op-overoverlay');
        const opened = currentDiv.getElementsByClassName('open');
        for (let _i = 0; _i < opened.length; _i++) {
            opened[_i].classList.remove('open');
        }
    }

    getLabelsAndDatasets(data, graphType): { datasets; labels } {
        console.log('getLabelsAndDatasets', data, graphType);
        let datasets = [];
        let labels = [];
        if (!data) return null;
        /*

        types of data :
            - linear : [10,6,9,12]
            - coordinate : [{x:5,y:9},{x:5,y:9}]
            - named : {stat1:10,stat2:5,stat3:8}
        types of datasets :
            - direct (one dataset)
            - array
            - named #NOT IMPLEMENTED
        types of graph :
            - scatter or line :
                - linear #INCORRECT : increment a var to use as x axis and map coordinate objects
                - coordinate : direct
                - named #INCORRECT: like linear, but name is showed on hoover
             - bar & else :
                - linear : direct, no labels
                - coordinate : #INCORRECT, will be considered as named
                - named : use keys as labels, values as data

         */

        function isCoordinate(data) {
            return (
                data &&
                data.constructor.name === 'Array' &&
                data.length > 0 &&
                !isNullOrUndefined(data[0]['x']) &&
                !isNullOrUndefined(data[0]['y'])
            );
        }
        function isLinear(data) {
            if (!data) {
                console.log('data is null');
                data = [];
                return true;
            }
            return (
                data.constructor.name === 'Array' &&
                (data.length == 0 || (data[0].constructor.name != 'Object' && data[0].constructor.name != 'Array'))
            );
        }
        function isNamed(data) {
            return data && data.constructor.name === 'Object' && isLinear([data[Object.keys(data)[0]]]);
        }

        let linear = isLinear(data);
        let coordinate = isCoordinate(data);
        let named = isNamed(data);
        let scatter = graphType === 'scatter';
        let line = graphType === 'line';

        let isMultipleDatasets = data.constructor.name === 'Array' && !linear && !coordinate && !named;
        if (isMultipleDatasets && !scatter && !line) {
            console.info('Error - incorrect graph type ' + graphType + ', multiple datasets are not allowed with this type for now');
        }
        let builtdatasets = isMultipleDatasets ? data : [data];
        let wrappedDatasets = [];
        if (builtdatasets.constructor.name === 'Object') {
            wrappedDatasets = Object.keys(builtdatasets).map(key => {
                return {
                    label: key,
                    data: builtdatasets[key]
                };
            });
        } else {
            wrappedDatasets = builtdatasets.map(ds => {
                return {
                    data: ds
                };
            });
        }
        let idx = 0;
        for (let dataset of wrappedDatasets) {
            if (scatter) {
                if (isCoordinate(dataset.data)) {
                    //direct
                } else {
                    console.info('Error - incorrect graph type ' + graphType + ', data should be coordinates');
                }
            } else if (line) {
                if (isCoordinate(dataset.data)) {
                    dataset.data.forEach(dt => {
                        labels.push(dt.x);
                    });
                } else if (isLinear(dataset.data)) {
                    //direct
                    labels.push('-');
                    /*dataset.data.forEach(dt=>{

                    })*/
                } else if (isNamed(dataset.data)) {
                    let orderedData = [];
                    Object.keys(dataset.data).map(key => {
                        labels.push(key);
                        orderedData.push(dataset.data[key]);
                    });
                    dataset.data = orderedData;
                } else {
                    console.info('Error 0- Could not identify data type', dataset.data);
                    dataset.data = [{ data: [] }];
                }
            } else {
                if (isCoordinate(dataset.data)) {
                    console.info('Error - incorrect graph type ' + graphType + ', data cannot be coordinates');
                } else if (isLinear(dataset.data)) {
                    //direct
                } else if (isNamed(dataset.data)) {
                    let orderedData = [];
                    Object.keys(dataset.data).map(key => {
                        labels.push(key);
                        orderedData.push(dataset.data[key]);
                    });
                    dataset.data = orderedData;
                } else {
                    console.info('Error - Could not identify data type', dataset.data);
                    dataset.data = [{ data: [] }];
                }
            }
        }

        return {
            datasets: wrappedDatasets.length > 0 ? wrappedDatasets : [{ data: data }],
            labels: labels.length > 0 ? labels : null
        };
    }
}

/*
Copyright 2017 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
