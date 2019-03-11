import { Component } from '@angular/core';

import { NotificationService } from './notification.service';

@Component({
    selector: 'notif-modal',
    templateUrl: './notification-modal.component.html'
})
export class NotifModalComponent {
    constructor(private notifService: NotificationService) {}
}
