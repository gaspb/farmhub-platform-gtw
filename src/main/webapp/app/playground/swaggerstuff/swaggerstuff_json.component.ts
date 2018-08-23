import { Component, Input, OnInit } from '@angular/core';
import { HjlSwaggerParamJson } from './swaggerparam_json.model';

@Component({
    selector: 'hjl-swagger-json',
    templateUrl: './swaggerstuff_json.component.html'
})
export class SwaggerStufJsonComponent implements OnInit {
    @Input('param') param: HjlSwaggerParamJson;

    constructor() {
        this.param = new HjlSwaggerParamJson('param1', {});
    }
    ngOnInit() {
        console.log('DEBUG--------------INITIATING SWAGGERSTUFF JSON COMPONENT', this.param);
    }
    createParam(name, value) {
        return new HjlSwaggerParamJson(name, value);
    }
}
