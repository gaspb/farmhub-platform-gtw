import { Route } from '@angular/router';

import { PlaygroundComponent } from './playground.component';
import { OpCanDeactivateGuard } from './opCanDeactivateGuard.guard';
import { UserRouteAccessService } from '../core/auth/user-route-access-service';

export const PLAYGROUND_ROUTE: Route = {
    path: 'playground',
    component: PlaygroundComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'playground Lab'
    },
    canActivate: [UserRouteAccessService],
    canDeactivate: [OpCanDeactivateGuard]
};
