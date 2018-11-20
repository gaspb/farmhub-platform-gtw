import { Component, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { LoginModalService } from '../core/login/login-modal.service';
import { Principal } from '../core/auth/principal.service';
import { Account } from '../core/user/account.model';

@Component({
    selector: 'jhi-home',
    templateUrl: './home.component.html',
    styleUrls: ['home.scss'],
    host: {
        class: 'fullpage-router'
    }
})
export class HomeComponent implements OnInit {
    account: Account;
    modalRef: NgbModalRef;
    toggled;

    //PARTICLES
    //<particles [params]="myParams" [style]="myStyle" [width]="width" [height]="height"></particles>
    particleParams: object = {
        particles: {
            number: {
                value: 120,
                density: {
                    enable: true,
                    value_area: 150
                }
            },
            color: {
                value: '#ffffff'
            },
            shape: {
                type: 'circle',
                stroke: {
                    width: 0,
                    color: '#000000'
                },
                polygon: {
                    nb_sides: 5
                },
                image: {
                    src: 'img/github.svg',
                    width: 100,
                    height: 100
                }
            },
            opacity: {
                value: 0.5,
                random: false,
                anim: {
                    enable: false,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: false,
                    speed: 15,
                    size_min: 0.2,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 70,
                color: '#ffffff',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 1.5,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: true,
                attract: {
                    enable: true,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 100,
                    line_linked: {
                        opacity: 1
                    }
                },
                bubble: {
                    distance: 400,
                    size: 40,
                    duration: 2,
                    opacity: 8,
                    speed: 3
                },
                repulse: {
                    distance: 200,
                    duration: 0.4
                },
                push: {
                    particles_nb: 2
                },
                remove: {
                    particles_nb: 2
                }
            }
        }
    };
    particleStyle: object = {};
    particleContWidth: number = 100;
    particleContHeight: number = 100;

    constructor(private principal: Principal, private loginModalService: LoginModalService, private eventManager: JhiEventManager) {}

    ngOnInit() {
        this.principal.identity().then(account => {
            this.account = account;
        });
        this.registerAuthenticationSuccess();
        this.toggled = false;
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
}
