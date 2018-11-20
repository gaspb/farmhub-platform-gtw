import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Observer, Subscription } from 'rxjs/Rx';

import { CSRFService } from 'app/core/auth/csrf.service';
import { WindowRef } from '../../core/tracker/window.service';
import { AuthServerProvider } from 'app/core/auth/auth-jwt.service';

import * as SockJS from 'sockjs-client';
import * as Stomp from 'webstomp-client';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Ws1MessageModel } from '../../demos/realtime/ws1.message.model';
import { Account } from '../../core/user/account.model';

@Injectable()
export class WsMessageService {
    stompClient = null;
    subscriber = null;
    connection: Promise<any>;
    connectedPromise: any;
    listener: Observable<any>;
    listenerObserver: Observer<any>;
    alreadyConnectedOnce = false;
    private subscription: Subscription;

    constructor(
        private http: HttpClient,
        private router: Router,
        private authServerProvider: AuthServerProvider,
        private localStorageService: LocalStorageService,
        private $window: WindowRef,
        // tslint:disable-next-line: no-unused-variable
        private csrfService: CSRFService
    ) {
        this.connection = this.createConnection();
        this.listener = this.createListener();
    }
    connectedWebsockets = [];
    connect(websocketPath: string) {
        //ws1
        if (this.connectedWebsockets.indexOf(websocketPath) >= 0) {
            console.log('Websocket ' + websocketPath + ' is already connected');
            return new Promise();
        }
        this.connectedWebsockets.push(websocketPath);
        if (this.connectedPromise === null) {
            this.connection = this.createConnection();
        }
        if (this.listener == null || this.listenerObserver == null) {
            this.listener = this.createListener();
        }
        // building absolute path so that websocket doesn't fail when deploying with a context path
        const loc = this.$window.nativeWindow.location;
        let url;
        url = '//' + loc.host + loc.pathname + 'websocket/' + websocketPath;
        const authToken = this.authServerProvider.getToken() | this.localStorageService.retrieve('token');
        if (authToken) {
            url += '?access_token=' + authToken + '';
        }

        const socket = new SockJS(url);
        const headers = {};
        this.stompClient = Stomp.over(socket);

        console.log('DEBUG1 ', headers);
        this.stompClient.connect(headers, () => {
            this.connectedPromise('success');
            console.log('DEBUG2', headers);
            this.connectedPromise = null;
            if (!this.alreadyConnectedOnce) {
                this.subscription = this.router.events.subscribe(event => {
                    if (event instanceof NavigationEnd) {
                        this.sendPplMessage('ended' + event.login);
                    }
                });
                this.alreadyConnectedOnce = true;
            }
        });

        return websocketPath === 'ws1'
            ? this.getMessages()
                  .toPromise()
                  .then(response => {
                      const queue = response.body;
                      console.log('RECIEVED QUEUE : ' + queue.length);
                      console.log(queue);
                      return queue;
                  })
            : new Promise();
    }

    getMessages(): Observable<HttpResponse<Ws1MessageModel[]>> {
        return this.http.get<Ws1MessageModel[]>('ws1/cache', { observe: 'response' });
    }

    disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
            this.stompClient = null;
        }
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
        this.connectedWebsockets = [];
        this.alreadyConnectedOnce = false;
    }

    receive() {
        return this.listener;
    }

    sendActivity() {
        if (this.stompClient !== null && this.stompClient.connected) {
            this.stompClient.send(
                '/topic/activity', // destination
                JSON.stringify({ page: this.router.routerState.snapshot.url }), // body
                {} // header
            );
        }
    }
    sendWs1Message(arg: string, account: Account) {
        const role =
            account.authorities.length == 0
                ? 'anonymous'
                : account.authorities.filter(role => role == 'ROLE_ADMIN').length > 0 ? 'admin' : 'user';
        const body = JSON.stringify({ body: arg, login: account.login, role: role });
        if (this.stompClient !== null && this.stompClient.connected) {
            console.log('SENDING MESSAGE : ', body);
            this.stompClient.send(
                '/ws1reciever', // destination
                body, // body
                {} // header
            );
        }
    }
    sendPplMessage(arg: string) {
        console.log('IN SEND MESSAGE : ', arg, this.stompClient, this.stompClient.connected);
        const body = JSON.stringify({ body: arg });
        if (this.stompClient !== null && this.stompClient.connected) {
            console.log('SENDING MESSAGE : ', body);
            this.stompClient.send(
                '/scala-ms-subscribe', // destination
                body, // body
                {} // header
            );
        }
    }

    subscribe(subscribePath: string) {
        //message/out
        this.connection.then(() => {
            this.subscriber = this.stompClient.subscribe('/topic/' + subscribePath, data => {
                console.log('RECIEVED DATA', data);
                this.listenerObserver.next(JSON.parse(data.body));
            });
        });
    }

    unsubscribe() {
        if (this.subscriber !== null) {
            this.subscriber.unsubscribe();
        }
        this.listener = this.createListener();
    }

    private createListener(): Observable<any> {
        return new Observable(observer => {
            this.listenerObserver = observer;
        });
    }

    private createConnection(): Promise<any> {
        return new Promise((resolve, reject) => (this.connectedPromise = resolve));
    }
}
