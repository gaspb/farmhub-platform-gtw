import { Route } from '@angular/router';

import { DeviceComponent } from './device.component';

export const DEVICE_ROUTE: Route = {
    path: 'device',
    component: DeviceComponent,
    data: {
        authorities: [],
        pageTitle: 'Dashboard'
    }
};
