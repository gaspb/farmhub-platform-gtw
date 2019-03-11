import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { JhiHealthService } from './health.service';

@Component({
    selector: 'jhi-health-modal',
    templateUrl: './health-modal.component.html'
})
export class JhiHealthModalComponent {
    currentHealth: any;

    constructor(private healthService: JhiHealthService, public activeModal: NgbActiveModal) {}

    baseName(name) {
        return this.healthService.getBaseName(name);
    }

    subSystemName(name) {
        return this.healthService.getSubSystemName(name);
    }

    readableValue(value: any) {
        if (this.currentHealth.name !== 'diskSpace') {
            return JSON.stringify(value, null, 4);
        }
        console.log('DEBUUUG------', value);
        // Should display storage space in an human readable unit
        let ret = {};
        Object.keys(value).forEach(key => {
            const val = value[key] / 1073741824;
            if (val > 1) {
                // Value
                ret[key] = val.toFixed(2) + ' GB';
            } else {
                ret[key] = (value[key] / 1048576).toFixed(2) + ' MB';
            }
        });
        return JSON.stringify(ret, null, 4);
    }
}
