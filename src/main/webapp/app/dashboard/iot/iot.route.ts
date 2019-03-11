import { Route } from '@angular/router';

import { IotComponent } from './iot.component';

export const IOT_ROUTE: Route = {
    path: 'iot',
    component: IotComponent,
    data: {
        authorities: [],
        pageTitle: 'IoT Lab'
    }
};
