import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { WsMessageService } from '../../shared/tracker/ws-message.service';
import { CookieService } from 'ngx-cookie';
import { CSRFService } from '../../core/auth/csrf.service';
import { LoginModalService } from '../../core/login/login-modal.service';
import { Principal } from '../../core/auth/principal.service';
import { Account } from '../../core/user/account.model';

@Component({
    selector: 'demo-ws1',
    templateUrl: './ws1.component.html',
    styleUrls: ['ws1.scss'],
    host: {
        class: 'fullpage-router'
    }
})
export class Ws1Component implements OnInit {
    @ViewChild('wscont') private myScrollContainer: ElementRef;
    account: Account;
    modalRef: NgbModalRef;
    activities: any[] = [];
    toggled;
    isToggledInfo = false;
    isAnon = true;
    constructor(
        private principal: Principal,
        private loginModalService: LoginModalService,
        private eventManager: JhiEventManager,
        private ws1MessageService: WsMessageService,
        private cookieService: CookieService,
        private csrfSvc: CSRFService
    ) {}

    onEnteredMessage($event) {
        console.log($event);
        this.ws1MessageService.sendWs1Message($event, this.account);
    }
    ngOnInit() {
        this.principal.isAuthenticated()
            ? this.principal.identity().then(account => {
                  this.account = account;
                  this.isAnon = false;
                  console.log('DEBUG', account);
              })
            : (this.account = new Account(false, [], '', '', '', '', 'anonymous-' + this.csrfSvc.getCSRF().split('-')[0], ''));
        this.registerAuthenticationSuccess();
        this.toggled = false;
        //TRACKER WEBSOCKET
        this.ws1MessageService.connect('ws1').then(queue => {
            this.activities = queue;
        });
        this.ws1MessageService.subscribe('/message/out');

        this.ws1MessageService.receive().subscribe(message => {
            this.displayMessages(message);
        });
    }
    ngOnDestroy() {
        this.ws1MessageService.unsubscribe();
    }
    displayMessages(message: any) {
        this.activities.push(message);
        this.scrollToBottom();
    }

    registerAuthenticationSuccess() {
        this.eventManager.subscribe('authenticationSuccess', message => {
            this.principal.identity().then(account => {
                this.account = account;
            });
        });
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }

    scrollToBottom(): void {
        /* console.log("Scrolling", this.myScrollContainer);
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch(err) { }*/
    }
}
