import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GtwSharedLibsModule } from './shared-libs.module';
import { GtwSharedCommonModule } from './shared-common.module';
import { AccountService } from '../core/auth/account.service';
import { LoginModalService } from '../core/login/login-modal.service';
import { LoginService } from '../core/login/login.service';
import { NgbDateMomentAdapter } from './util/datepicker-adapter';
import { NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import { HasAnyAuthorityDirective } from './auth/has-any-authority.directive';
import { JhiLoginModalComponent } from './login/login.component';
import { StateStorageService } from '../core/auth/state-storage.service';
import { Principal } from '../core/auth/principal.service';
import { CSRFService } from '../core/auth/csrf.service';
import { JhiTrackerService } from '../core/tracker/tracker.service';
import { Ws1MessageService } from './tracker/ws1-message.service';
import { AuthServerProvider } from '../core/auth/auth-jwt.service';
import { StackService } from './stack/stack.service';
import { UserService } from '../core/user/user.service';

@NgModule({
    imports: [GtwSharedLibsModule, GtwSharedCommonModule],
    declarations: [JhiLoginModalComponent, HasAnyAuthorityDirective],
    providers: [
        { provide: NgbDateAdapter, useClass: NgbDateMomentAdapter },
        LoginService,
        LoginModalService,
        AccountService,
        StateStorageService,
        Principal,
        CSRFService,
        JhiTrackerService,
        Ws1MessageService,
        AuthServerProvider,
        StackService,
        UserService,
        DatePipe
    ],
    entryComponents: [JhiLoginModalComponent],
    exports: [GtwSharedCommonModule, JhiLoginModalComponent, HasAnyAuthorityDirective, DatePipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GtwSharedModule {}
