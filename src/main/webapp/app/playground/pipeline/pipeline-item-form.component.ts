import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PlaygroundService } from '../playground.service';
import { MSDTO } from '../msdto.model';
import { HjlSwaggerParamJson } from '../swaggerstuff/swaggerparam_json.model';
import { Endpoint, EndpointWithTrigger, Opt, Trigger } from './pipeline.model';

@Component({
    selector: 'pipeline-item-form',
    templateUrl: './pipeline-item-form.component.html'
})
export class PipelineItemFormComponent implements OnInit {
    selectedMS: MSDTO;
    selectedApi;
    currentPrettyJSON;
    endpointWithTrigger: EndpointWithTrigger = new EndpointWithTrigger();
    endpoint: Endpoint = new Endpoint();
    trigger: Trigger = new Trigger();

    @Output() completeForm: EventEmitter<any> = new EventEmitter<any>();
    formItem;

    @Input('formType') formType;
    @Input('formActive') formActive;
    bdtt;
    opt = new Opt();

    ops: any;
    MSes: MSDTO[];
    bdts: any; //big data transformations

    constructor(private pgService: PlaygroundService) {}

    ngOnInit() {
        this.formType = '';
        this.formItem = {};
        this.getDataTransformations(); //todo check formType when loaded
    }

    log(...any) {
        console.log('PIPELINE_FORM_LOGGER', any);
    }

    getOps() {
        this.pgService.getOperationList().subscribe(data => {
            console.log('EMIT ---- GET OPS ', data);
            this.ops = data;
        });
    }
    getMSes() {
        this.pgService.getRegisteredMS().subscribe(
            (swaggerApis: any[]) => {
                console.log('GET REGISTERED MS ', swaggerApis);

                this.MSes = this.pgService.mapSwaggetToMsDTO(swaggerApis);
            },

            error => {
                console.log('ERROR', error);
            }
        );
    }
    get(formType) {
        switch (formType) {
            case 'op':
                this.getOps();
                break;
            case 'ms':
                this.getMSes();
                break;
        }
    }
    getDataTransformations() {
        this.bdts = [
            'Linear regression',
            'Reduce',
            'Map',
            'Thresholds and limits',
            'Alerts',
            'Image recognition',
            'Image sanitizing',
            'Occurrences',
            '+'
        ];
    }

    selectOp(name) {
        this.formItem.data = this.ops.filter(item => (item.operationName = name))[0];
        this.completeForm.emit(this.formItem);
    }
    selectMs(name) {
        this.selectedMS = this.MSes.filter(item => item.serviceId == name)[0];
    }
    selectMsApi(api) {
        this.selectedApi = this.selectedApi == api.path + '::' + api.reqType ? null : api.path + '::' + api.reqType;
        this.currentPrettyJSON = this.getPrettifiedJSONApi(this.selectedMS, api.parameters);
    }
    completeSelectMsApi(ms, path, type) {
        this.formItem.data = ms.apiDoc.filter(item => item.path == path && item.reqType == type)[0];
        this.completeForm.emit(this.formItem);
        this.selectedMS = null;
        this.selectedApi = null;
    }

    selectBdt(name) {
        //TEMP
        if (name === 'Occurrences') {
            this.opt.type = 'WORD_OCCURENCE_COUNT';
        }
        if (name === 'Map') {
            let opt = new Opt();
            opt.type = this.opt.from + '_TO_' + this.opt.to;
            this.opt = opt;
        }
        if (this.opt.type.indexOf('_COLLECTION') > 0) {
            let split = this.opt.type.split('_COLLECTION');
            this.opt.collectionLevel = (split.length - 1).toString();
            this.opt.type = split[0];
        }

        this.formItem.name = name;
        this.formItem.data = this.opt;
        this.completeForm.emit(this.formItem);
        this.cancel();
    }
    selectOut(name) {
        this.formItem.name = name;
        this.opt.type = name;
        this.formItem.data = this.opt;
        this.opt = new Opt();
    }
    emit() {
        this.completeForm.emit(this.formItem);
    }

    cancel() {
        this.opt = new Opt();
        this.bdtt = null;
        this.formItem = {};
    }

    createParam(name, value) {
        return new HjlSwaggerParamJson(name, value);
    }

    //returns a json object like {
    // propertyName : propertyType,
    getPrettifiedJSONApi(msApi, obj) {
        return this.pgService.getPrettifiedJSONApi(msApi, obj);
    }
    getResponseJSON(api, responseModel) {
        return this.pgService.prettify(
            responseModel.schema.type ? responseModel.schema.type : this.pgService.getJSONSchemaDefinition(api, responseModel.schema.$ref)
        );
    }

    //V2
    emitEndpointWtTrigger() {
        this.endpointWithTrigger.endpoint = this.endpoint;
        this.endpointWithTrigger.trigger = this.trigger;
        this.formItem.data = this.endpointWithTrigger;
        this.endpoint.name = 'RANDOM_TODO_' + Math.random();
        this.formItem.name = this.endpoint.name;
        this.completeForm.emit(this.formItem);
        this.formItem.type = null;
        this.endpoint = new Endpoint();
    }

    openBdt(bdtt) {
        this.bdtt = bdtt;
        this.opt = new Opt();
    }
}
