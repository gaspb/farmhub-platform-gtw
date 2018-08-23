import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { errorRoute } from './error/error.route';
import { stackRoute } from './stack/stack.route';
import { navbarRoute } from './navbar/navbar.route';

const LAYOUT_ROUTES = [stackRoute, navbarRoute, ...errorRoute];

@NgModule({
    imports: [RouterModule.forRoot(LAYOUT_ROUTES, { useHash: true })],
    exports: [RouterModule]
})
export class LayoutRoutingModule {}
