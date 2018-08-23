import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../core/user/user.model';
import { Subscription } from 'rxjs/Rx';
import { UserService } from '../../core/user/user.service';

@Component({
    selector: 'jhi-user-mgmt-detail',
    templateUrl: './user-management-detail.component.html'
})
export class UserMgmtDetailComponent implements OnInit, OnDestroy {
    user: User;
    private subscription: Subscription;

    constructor(private userService: UserService, private route: ActivatedRoute) {}

    ngOnInit() {
        this.subscription = this.route.params.subscribe(params => {
            this.load(params['login']);
        });
    }

    load(login) {
        this.userService.find(login).subscribe(response => {
            this.user = response.body;
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
