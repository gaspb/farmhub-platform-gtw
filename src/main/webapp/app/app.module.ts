import './vendor.ts';

import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Ng2Webstorage } from 'ngx-webstorage';
import { JhiEventManager } from 'ng-jhipster';

import { AuthExpiredInterceptor } from './blocks/interceptor/auth-expired.interceptor';
import { ErrorHandlerInterceptor } from './blocks/interceptor/errorhandler.interceptor';
import { NotificationInterceptor } from './blocks/interceptor/notification.interceptor';

import { GtwAppRoutingModule } from './app-routing.module';
import { GtwHomeModule } from './home/home.module';
import { GtwAccountModule } from './account/account.module';
import { GtwEntityModule } from './entities/entity.module';
// jhipster-needle-angular-add-module-import JHipster will add new module here
import { ErrorComponent, FooterComponent, JhiMainComponent, NavbarComponent, PageRibbonComponent } from './layouts';
import { GtwSharedModule } from './shared/shared.module';
import { GtwCoreModule } from './core/core.module';
import { StackComponent } from './layouts/stack/stack.component';
import { GtwRepoModule } from './repository/repo.module';
import { GtwDashboardModule } from './dashboard/dashboard.module';
import { GtwDocumentationModule } from './documentation/documentation.module';
import { PlaygroundModule } from './playground/playground.module';
import { MSTemplateModule } from './framework/mstemplate.module';
import { GtwWs1Module } from './demos/realtime/ws1.module';
import { GtwIotModule } from './iot/iot.module';
import { UserRouteAccessService } from './core/auth/user-route-access-service';
import { GtwAboutTheLabModule } from './aboutthelab/aboutthelab.module';
import { GtwGetStartedModule } from './getstarted/getstarted.module';
import { ParticlesModule } from 'angular-particle';

@NgModule({
    imports: [
        BrowserModule,
        GtwAppRoutingModule,
        Ng2Webstorage.forRoot({ prefix: 'jhi', separator: '-' }),
        GtwSharedModule,
        GtwCoreModule,
        GtwHomeModule,
        GtwAccountModule,
        GtwEntityModule,
        GtwEntityModule,
        GtwIotModule,
        GtwWs1Module,
        MSTemplateModule,
        PlaygroundModule,
        GtwDocumentationModule,
        GtwDashboardModule,
        GtwRepoModule,
        GtwAboutTheLabModule,
        GtwGetStartedModule,
        ParticlesModule
        // jhipster-needle-angular-add-module JHipster will add new module here
    ],
    declarations: [JhiMainComponent, NavbarComponent, ErrorComponent, PageRibbonComponent, FooterComponent, StackComponent],
    providers: [
        UserRouteAccessService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthExpiredInterceptor,
            multi: true,
            deps: [Injector]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorHandlerInterceptor,
            multi: true,
            deps: [JhiEventManager]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: NotificationInterceptor,
            multi: true,
            deps: [Injector]
        }
    ],
    bootstrap: [JhiMainComponent]
})
export class GtwAppModule {}
