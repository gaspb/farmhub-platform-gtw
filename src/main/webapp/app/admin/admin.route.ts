import { Routes } from '@angular/router';

import {
    configurationRoute,
    docsRoute,
    gatewayRoute,
    healthRoute,
    logsRoute,
    metricsRoute,
    trackerRoute,
    userDialogRoute,
    userMgmtRoute
} from './';
import { UserRouteAccessService } from '../core/auth/user-route-access-service';

const ADMIN_ROUTES = [configurationRoute, docsRoute, healthRoute, logsRoute, gatewayRoute, trackerRoute, ...userMgmtRoute, metricsRoute];

export const adminState: Routes = [
    {
        path: '',
        data: {
            authorities: ['ROLE_ADMIN']
        },
        canActivate: [UserRouteAccessService],
        children: ADMIN_ROUTES
    },
    ...userDialogRoute
];
