import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ProfileService } from '../profiles/profile.service';

import { VERSION } from '../../app.constants';
import { LoginService } from '../../core/login/login.service';
import { Principal } from '../../core/auth/principal.service';
import { LoginModalService } from '../../core/login/login-modal.service';
import { NotificationService } from '../../shared/notification/notification.service';
import { NotificationDTO } from '../../shared/notification/notification.model';
import { DashboardService } from '../../dashboard/dashboard.service';
import { Account } from '../../core/user/account.model';

@Component({
    selector: 'jhi-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['navbar.scss']
})
export class NavbarComponent implements OnInit {
    inProduction: boolean;
    isNavbarCollapsed: boolean;
    languages: any[];
    swaggerEnabled: boolean;
    modalRef: NgbModalRef;
    version: string;
    userNotifications: { notif; route }[] = [];

    constructor(
        private loginService: LoginService,
        private principal: Principal,
        private loginModalService: LoginModalService,
        private profileService: ProfileService,
        private router: Router,
        private notificationService: NotificationService
    ) {
        this.userNotifications = [];
        this.version = VERSION ? 'v' + VERSION : '';
        this.isNavbarCollapsed = true;
    }

    ngOnInit() {
        this.profileService.getProfileInfo().then(profileInfo => {
            this.inProduction = profileInfo.inProduction;
            this.swaggerEnabled = profileInfo.swaggerEnabled;
        });
        this.notificationService.userEventEmitter.subscribe(notifs => {
            console.log('Received notifications from notificationService : ', notifs);
            if (notifs) {
                notifs.forEach(notif => {
                    switch (notif.name) {
                        case 'invite_team':
                            console.log('');
                            this.userNotifications.push({
                                notif: notif,
                                route: 'dashboard'
                            });
                    }

                    return notif;
                });
            }
        });
    }

    debugNotifServ() {
        this.notificationService.pushNotificationToSelf(new NotificationDTO('admin', 'admin', 'usr', 'upd', 'someval', '', 'sometext'));
    }

    collapseNavbar() {
        this.isNavbarCollapsed = true;
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }

    logout() {
        this.collapseNavbar();
        this.loginService.logout();
        this.router.navigate(['']);
    }

    toggleNavbar() {
        this.isNavbarCollapsed = !this.isNavbarCollapsed;
    }

    getImageUrl() {
        return this.isAuthenticated() ? this.principal.getImageUrl() : null;
    }
}
