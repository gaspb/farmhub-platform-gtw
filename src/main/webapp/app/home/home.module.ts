import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GtwSharedModule } from '../shared';

import { HOME_ROUTE, HomeComponent } from './';
import { ParticlesModule } from 'angular-particle';

@NgModule({
    imports: [GtwSharedModule, RouterModule.forChild([HOME_ROUTE]), ParticlesModule],
    declarations: [HomeComponent],
    entryComponents: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GtwHomeModule {}
