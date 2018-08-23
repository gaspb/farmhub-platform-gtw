import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PlaygroundService } from '../playground.service';
import { MSDTO } from '../msdto.model';
import { HjlSwaggerParamJson } from '../swaggerstuff/swaggerparam_json.model';

@Component({
    selector: 'pipeline-item-form',
    templateUrl: './pipeline-item-form.component.html'
})
export class PipelineItemFormComponent implements OnInit {
    selectedMS: MSDTO;
    selectedApi;
    currentPrettyJSON;
    @Output() completeForm: EventEmitter<any> = new EventEmitter<any>();
    formItem;

    @Input('formType') formType;
    @Input('formActive') formActive;
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
        this.bdts = ['Linear regression', 'Reduce', 'Map', 'Thresholds and limits', 'Alerts', 'Image recognition', 'Image sanitizing', '+'];
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
        this.formItem.name = name;
        this.completeForm.emit(this.formItem);
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
}
