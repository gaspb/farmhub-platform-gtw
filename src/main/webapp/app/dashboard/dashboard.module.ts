import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GtwSharedModule } from '../shared';

import { DASHBOARD_ROUTE, DashboardComponent } from './';
import { DsbGridDirective } from './dsb-grid.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardService } from './dashboard.service';
import { DeviceComponent } from './devices/device.component';
import { IotComponent } from './iot/iot.component';

@NgModule({
    imports: [GtwSharedModule, RouterModule.forRoot([DASHBOARD_ROUTE], { useHash: true }), ReactiveFormsModule, FormsModule],
    declarations: [DashboardComponent, DsbGridDirective, DeviceComponent, IotComponent],
    entryComponents: [],
    providers: [DashboardService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GtwDashboardModule {}
