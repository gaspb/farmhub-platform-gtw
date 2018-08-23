import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { ApiDoc } from './apidoc.model';
import { PlaygroundService } from './playground.service';
import { MSDTO } from './msdto.model';
import { DragNDropDirective } from './dragndrop.directive';
import { OperationComponent } from './operationview.component';
import { Principal } from '../core/auth/principal.service';
import { LoginModalService } from '../core/login/login-modal.service';

@Component({
    selector: 'jhi-playground',
    templateUrl: './playground.component.html',
    styleUrls: ['playground.scss']
})
export class PlaygroundComponent implements OnInit, OnDestroy {
    itemToDrop;
    isToggledMs;
    operationView = false;
    isToggledApi;
    isToggledOpMenu;
    account: Account;
    modalRef: NgbModalRef;
    toggled;
    routes: ApiDoc[];
    MSes: MSDTO[];
    OPes: any;
    pbcApis: any;
    converters: any;
    test: ApiDoc;
    test3: string;
    isDraggable;
    isToggledOp;
    draggedItem = '123';
    tpFiltering = false;
    currView = 'tp';
    //su

    constructor(
        private principal: Principal,
        private loginModalService: LoginModalService,
        private eventManager: JhiEventManager,
        private pgService: PlaygroundService
    ) {
        this.itemToDrop = {};
    }

    ngOnInit() {
        this.principal.identity().then(account => {
            this.account = account;
        });
        this.registerAuthenticationSuccess();
        this.toggled = false;
        this.pgService.getEndpoints().subscribe(response => {
            this.test3 = response;
        });

        //this.MSes = this.pgService.getMockMS();
        this.OPes = this.pgService.getMockOp();
        this.loadPublicApis();

        const test = this.pgService.getOperationList().subscribe(
            data => {
                console.log('GET OPS ', data);
                this.OPes = data;
            },
            error => {
                console.log('ERROR', error);
            }
        );
        const OPFromCache2 = this.pgService.getOperationJSON('Any to ES').subscribe(
            data => {
                console.log('GET OP TEMPLATE 0101 ', data);
            },
            error => {
                console.log('ERROR', error);
            }
        );
        this.converters = this.pgService.getMockConverters();
        this.loadSwaggerRegisteredMicroservices();
        // this.routes.push(this.test);
    }

    loadSwaggerRegisteredMicroservices() {
        this.pgService.getRegisteredMS().subscribe(
            (swaggerApis: any[]) => {
                console.log('GET REGISTERED MS ', swaggerApis);

                this.MSes = this.pgService.mapSwaggetToMsDTO(swaggerApis);
                console.log('=>MaPPED MSDTOs', this.MSes);
            },

            error => {
                console.log('ERROR', error);
            }
        );
    }

    ngOnDestroy() {}
    registerAuthenticationSuccess() {
        this.eventManager.subscribe('authenticationSuccess', message => {
            this.principal.identity().then(account => {
                this.account = account;
            });
        });
    }

    loadPublicApis() {
        this.pbcApis = this.pgService.getMockPublicApis();

        this.pgService.getPublicApiList().subscribe((apis: [any]) => {
            let mappedApis = apis.map(api => {
                console.log('MAPPING API ', api);
                let mappedApi = {
                    title: api['name'],
                    desc: api['desc'],
                    body: {
                        inputType: api['input']['type'],
                        outputType: api['output']['type']
                    },
                    _api: api['url'],
                    _transformation: encodeURI,
                    _params: {}
                };
                //TODO map the rest (_mandatory, desc etc..)
                if (api['_params']) {
                    for (let param of api._params) {
                        if (param._editable) {
                            mappedApi._params[param.name] = param._default;
                        }
                    }
                }
                console.log('Get public API List map -  ', mappedApi);
                return mappedApi;
            });

            console.log('Get public API List returned ', mappedApis);
            this.pbcApis = this.pbcApis.concat(mappedApis);
        });
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }
    dragStart(itemType, draggedItem) {
        console.log('PG-DRAGSTART', event);
        if (draggedItem === null) {
            draggedItem = { type: itemType };
        }
        this.draggedItem = draggedItem;
        (event as DragEvent).dataTransfer.setData('Text', JSON.stringify({ type: itemType }));
    }

    //DEPR ?
    getApiBody(textContent) {
        const body = textContent.split(' ');
        const body2 = [];
        const body3 = {};

        for (let i = 0; i < body.length; i++) {
            const arr = body[i].trim().split(':');
            for (let f = 0; f < arr.length; f++) {
                if (arr[f].length > 0) {
                    body2.push(arr[f]);
                }
            }
        }

        let j = null;
        for (let i = 0; i < body2.length; i++) {
            if (body2[i].length > 1) {
                if (j != null) {
                    body3[j] = body2[i];
                    j = null;
                } else {
                    j = body2[i];
                }
            }
        }
        return body3;
    }
    toggleOp(ev) {
        if (this.tpFiltering) {
            this.OPes.map(op => (op.active = null));
            this.tpFiltering = false;
            return;
        }
        this.tpFiltering = true;
        this.isToggledOpMenu = ev.toggleOpMenu;
        // this.isToggledOp==null ? this.isToggledOp = this.OPes[0] : '';
        const io = ev.ioType;
        if (io === 'input') {
            this.OPes.filter(op => op.input != undefined).map(op => (op.active = { input: true }));
        }
        if (io === 'output') {
            this.OPes.filter(op => op.input != undefined).map(op => (op.active = { output: true }));
        }
    }
    handleOpTpConnect(op) {
        if (op.active) {
            const obj = DragNDropDirective.initTpConnection(op, 'menu');
            if (obj != null) {
                this.tpFiltering = true;
                this.toggleOp('');
                obj.tpItem.classList.remove('tp-connect-active');
            }
            OperationComponent.jsonTemplate[obj.tpItem.getAttribute('data-tp-type')][obj.tpItem.parentElement.id] = {
                op: obj.op,
                io: obj.tpItem.dataset.io
            };
        }
    }

    updateVar(ev) {
        //TODO some checks
        console.log('UPDATENG COMPONENT VAR -' + ev.name + ' - current :  ', this[ev.name]);
        console.log('WITH : ', ev.value);
        this[ev.name] = ev.value;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        console.log('PG KEYPRESS', event.key, event.which);
        if (event.key === 's' && event.ctrlKey) {
            OperationComponent.instances[this.operationView ? 'op' : 'tp'].save();
            event.preventDefault();
            return false;
        } else if (event.key === 'Escape') {
            if (this.operationView) {
                DragNDropDirective.resetOpConnection();
            } else {
                DragNDropDirective.resetTpConnection();
                this.tpFiltering = true;
                this.toggleOp('');
                let l = document.getElementsByClassName('tp-connect-active');
                for (let x = 0; x < l.length; x++) {
                    l[x].classList.remove('tp-connect-active');
                }
            }
        }
    }
}
