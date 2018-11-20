import { Route } from '@angular/router';

import { GetStartedComponent } from './';

export const GETSTARTED_ROUTE: Route = {
    path: 'getstarted',
    component: GetStartedComponent,
    data: {
        authorities: [],
        pageTitle: 'Get Started'
    }
};
