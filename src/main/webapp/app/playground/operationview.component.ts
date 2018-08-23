import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';
import { DragNDropDirective } from './dragndrop.directive';
import { OpTemplateService } from './op-templates.service';
import { PlaygroundService } from './playground.service';
import { Observable } from 'rxjs/Observable';
import { OperationLogicService } from './operation-logic.service';
import { downloadAsFile } from '../shared/util/file-util';

@Component({
    selector: 'operation-view',
    template: `
              <div [ngClass]="{'testMode': testMode}" class="drop-container"><div id="op-bin-{{instanceId}}" *ngIf="(isDraggedOver && draggedItem==null)"  ><i class="fa fa-trash op-trash" aria-hidden="true" (dragover)="dragOver('trash')" (dragleave)="isTrashDraggedOver=false"></i></div>
                  <div  class="top-container" [ngClass]="isTrashActive ? 'trash-active' : ''">
                          <span class="topMenu"><span [ngClass]="saveBtn==='Save' ? 'save' : ('saved'+ (isOp?'-op':'-tp'))" (click)="save()">{{saveBtn}}</span><span class="new" (click)="empty()">New</span><span class="load" (click)="load()">Load</span><span [ngClass]="{'test' : testMode} " class="try" (click)="isOp ? runOpLogic() : testTemplate()">{{isOp ? 'Run' : testMode ? 'TEST MODE' : 'Test'}}</span><span (click)="downloadJSON()"><fa-icon [icon]="'download'"></fa-icon></span>
                              </span><span class="op-trash-right trash" *ngIf="isOp" (click)="isTrashActive = !isTrashActive"><fa-icon [icon]="'trash-alt'"></fa-icon></span>
                      <div class="op-desc-cont"><h3 contenteditable="true" spellcheck="false" class="pg-title" (blur)="cpName = $event.srcElement.textContent; saveBtn = 'Save'">{{cpName}}</h3>
                      <div class="op-desc-value" draggable="false">Desc : <textarea class="op-desc" spellcheck="false"></textarea></div></div>
                  </div>
                  <div class="op-display" [ngClass]="displayContent!=null ? 'open' : ''">
                      <span style="font-weight:500">Output</span>                  
                      <textarea disabled>{{displayContent}}</textarea>
                      <button (click)="displayContent=null">Close</button>
                  </div>
<div id="op-content-{{instanceId}}" class="op-content"  (dragleave)="isDraggedOver=false" (drop)="isDraggedOver=false" (dragover)="dragOver()" [ngClass]="{ 'dragtome': isDraggedOver==true, 'testMode' : testMode}">
    <div class="op-overlay" (click)="hideOverlay($event)"></div>
</div>
                  <div class="i-o-bar" *ngIf="isOp" > <div id="o-op-0" class="o-op io-op-main" ><span class="io">I</span></div>
                      <div id="i-op-0" class="i-op io-op-main"  ><span class="io">O</span></div></div>
              </div>`
})
export class OperationComponent implements OnDestroy {
    isDraggedOver: boolean;
    displayContent = null;
    isTrashDraggedOver: boolean;
    isTrashActive: boolean;
    instanceId: any;
    opId = 1;
    saveBtn = 'Save';
    testMode = false;
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
        private opLogicService: OperationLogicService
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
    public displayOpResult(result) {
        this.displayContent = JSON.stringify(result, null, 4);
    }

    /**
     * START RUN OP
     */
    public async runOpLogic() {
        //TODO remove input prompt when no input, and adapt it to json/string
        this.displayOpResult(await this.opLogicService.runOpLogic(this.getLogic(), prompt('input ?')));
    }

    listenedTemplateElems = [];
    public async testTemplate() {
        if (this.testMode) {
            this.testMode = false;
            await this.listenedTemplateElems.map(elem => elem[0].removeEventListener('click', elem[1]));
            this.listenedTemplateElems = [];
            return;
        }
        this.testMode = true;
        //TODO filter out unconnected elems or duplicates

        const inputs = ['tp-button', 'tp-text'];
        const outputs = ['tp-datatable-out', 'tp-text-out'];
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
            console.log('D2', op, input, input.id, document.getElementById(input.id));
            function _tpButtonClickHandler() {
                let inputVal = input.body;
                self.opLogicService
                    .execute('operation', inputVal, { operationName: op })
                    .then(out => (document.getElementById(output.id).getElementsByClassName('tp-output-value')[0].textContent = out));
            }

            //temp => TODO try not tu use document.getElementById but create actual divs in another layer and attach drectly events to them (so they are destroyed on test end)
            const elem = document.getElementById(input.id);
            elem.addEventListener('click', _tpButtonClickHandler);
            this.listenedTemplateElems.push([elem, _tpButtonClickHandler]);
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
            let links = this.retrieveLogic('link');
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
                    }
                });
            }
        }

        return false;
    }

    removeItemIfChild(item) {
        let div = item.className != 'child' ? DragNDropDirective.closest(item, ['child'], 7) : item;
        if (div == null) {
            return false;
        }
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
                            this.saveLogic(obj.tpItem.getAttribute('data-tp-type'), obj.tpItem.parentElement.id, {
                                op: obj.op,
                                io: obj.tpItem.dataset.io
                            });
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
}

/*
Copyright 2017 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
