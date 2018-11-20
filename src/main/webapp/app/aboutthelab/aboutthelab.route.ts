import { Route } from '@angular/router';
import { AboutTheLabComponent } from './aboutthelab.component';

export const ABOUTTHELAB_ROUTE: Route = {
    path: 'aboutthelab',
    component: AboutTheLabComponent,
    data: {
        authorities: [],
        pageTitle: 'About the Lab'
    }
};
