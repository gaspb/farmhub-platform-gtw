import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GtwSharedModule } from '../shared';
import {
    adminState,
    GatewayRoutesService,
    JhiConfigurationComponent,
    JhiConfigurationService,
    JhiDocsComponent,
    JhiGatewayComponent,
    JhiHealthCheckComponent,
    JhiHealthModalComponent,
    JhiHealthService,
    JhiMetricsMonitoringComponent,
    JhiMetricsMonitoringModalComponent,
    JhiMetricsService,
    JhiTrackerComponent,
    LogsComponent,
    LogsService,
    UserDeleteDialogComponent,
    UserDialogComponent,
    UserMgmtComponent,
    UserMgmtDeleteDialogComponent,
    UserMgmtDetailComponent,
    UserMgmtDialogComponent,
    UserModalService,
    UserResolve,
    UserResolvePagingParams
} from './';
import { JhiTrackerService } from '../core/tracker/tracker.service';
/* jhipster-needle-add-admin-module-import - JHipster will add admin modules imports here */

@NgModule({
    imports: [
        GtwSharedModule,
        RouterModule.forChild(adminState)
        /* jhipster-needle-add-admin-module - JHipster will add admin modules here */
    ],
    declarations: [
        UserMgmtComponent,
        UserDialogComponent,
        UserDeleteDialogComponent,
        UserMgmtDetailComponent,
        UserMgmtDialogComponent,
        UserMgmtDeleteDialogComponent,
        LogsComponent,
        JhiConfigurationComponent,
        JhiHealthCheckComponent,
        JhiHealthModalComponent,
        JhiDocsComponent,
        JhiGatewayComponent,
        JhiTrackerComponent,
        JhiMetricsMonitoringComponent,
        JhiMetricsMonitoringModalComponent
    ],
    entryComponents: [UserMgmtDialogComponent, UserMgmtDeleteDialogComponent, JhiHealthModalComponent, JhiMetricsMonitoringModalComponent],
    providers: [
        JhiConfigurationService,
        JhiHealthService,
        JhiMetricsService,
        GatewayRoutesService,
        LogsService,
        JhiTrackerService,
        UserResolvePagingParams,
        UserResolve,
        UserModalService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GtwAdminModule {}
