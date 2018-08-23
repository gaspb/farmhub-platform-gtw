import { Component, Input, OnInit } from '@angular/core';
import { HjlSwaggerParamJson } from './swaggerparam_json.model';

@Component({
    selector: 'hjl-swagger',
    templateUrl: './swaggerstuff.component.html'
})
export class SwaggerStuffComponent implements OnInit {
    @Input('masterParam') masterParam: HjlSwaggerParamJson;
    constructor() {}

    ngOnInit() {
        console.log('DEBUG--------------INITIATING SWAGGERSTUFF COMPONENT', this.masterParam);
    }
    ngOnDestroy() {}
}
