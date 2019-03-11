import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Account } from '../../core/user/account.model';
import { Principal } from '../../core/auth/principal.service';
import { NotificationDTO } from './notification.model';
import { BehaviorSubject, Observable, Observer } from 'rxjs/Rx';
import { AuthServerProvider } from '../../core/auth/auth-jwt.service';
import { LocalStorageService } from 'ngx-webstorage';
import { WindowRef } from '../../core/tracker/window.service';
import { Client } from 'webstomp-client';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'webstomp-client';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable()
export class NotificationService {
    stompClient: Client = null;
    account: Account;
    technicalEventEmitter: BehaviorSubject<NotificationDTO[]>;
    userEventEmitter: BehaviorSubject<NotificationDTO[]>;
    notifications: NotificationDTO[];
    init = false;

    subscriber = null;
    connection: Promise<any>;
    connectedPromise: any;
    listener: Observable<any>;
    notificationListener: Observer<any>;

    constructor(
        private http: HttpClient,
        private principal: Principal,
        private authServerProvider: AuthServerProvider,
        private localStorageService: LocalStorageService,
        private $window: WindowRef
    ) {
        this.notifications = [];
        this.technicalEventEmitter = new BehaviorSubject<NotificationDTO[]>(null);
        this.userEventEmitter = new BehaviorSubject<NotificationDTO[]>(null);
        principal.identity().then(account => (this.account = account));
        this.initNotifications().then(val => (this.init = true));
        this.initWebSocket().then(() => {
            console.log('Notif Websocket init completed');
            //DEBUG
            this.stompClient.subscribe('/user/queue/update', m => {
                console.log('!!!! RECIEVED MESSAGE NOTIF -- ', m);
            });
        });
    }

    pushNotificationToSelf(notif) {
        let emitter = notif.type === 'tec' ? this.technicalEventEmitter : this.userEventEmitter;
        let curr = emitter.value;
        if (!curr) {
            curr = [];
        }
        curr.push(notif);
        this.notifications = curr;
        emitter.next(curr);
    }
    private initNotifications() {
        console.log('Initializing notifications');
        return new Promise((resolve, reject) => {
            this.http.get('api/dashboard/notifications', httpOptions).subscribe((dtoList: any[]) => {
                let val: NotificationDTO[] = dtoList.map(dto => {
                    return dto && dto['base64'] ? NotificationDTO.fromBase64(dto['base64']) : null; //TODO
                });
                this.technicalEventEmitter.next(val.filter(dto => dto && dto['type'] === 'tec'));
                this.userEventEmitter.next(val.filter(dto => dto && dto['type'] === 'usr'));
                this.notifications = val;
                resolve(val);
            });
        });
    }

    sendNotificationHTTP(notif: NotificationDTO) {
        console.log('sendNotificationHTTP :', notif);

        let obj = {
            id: notif.toUser,
            base64: btoa(JSON.stringify(notif))
        };

        return this.http.post('api/notification/send/', obj, httpOptions);
    }
    sendNotificationWS(notif: NotificationDTO) {
        console.log('sendNotificationWS :', notif);

        this.stompClient.send('/topic/notif', JSON.stringify(notif), {});
    }

    initWebSocket() {
        const loc = this.$window.nativeWindow.location;
        let url = '//' + loc.host + loc.pathname + 'websocket/' + 'notif';
        const authToken = this.authServerProvider.getToken() | this.localStorageService.retrieve('token');
        if (authToken) {
            url += '?access_token=' + authToken + '';
        }

        const socket = new SockJS(url);
        const headers = {};
        this.stompClient = Stomp.over(socket);

        console.log('DEBUG1 ', headers);
        return new Promise<any>((resolve, reject) => {
            this.stompClient.connect(headers, () => {
                this.subscriber = this.stompClient.subscribe('/user/topic/notif', data => {
                    console.log('RECEIVED NOTIFICATION', data);
                    const json = JSON.parse(data.body);

                    if (json.type === 'tec' || json.type === 'both') {
                        console.log('emitting technical');
                        let val = /*this.technicalEventEmitter.value ? this.technicalEventEmitter.value : */ []; //TODO
                        val.push(json);
                        this.technicalEventEmitter.next(val);
                    }
                    if (json.type === 'usr' || json.type === 'both') {
                        console.log('emitting user');
                        let val = this.userEventEmitter.value ? this.userEventEmitter.value : [];
                        val.push(json);
                        this.userEventEmitter.next(val);
                    }
                });

                //TODO
                resolve();
            });
        });
    }
}
