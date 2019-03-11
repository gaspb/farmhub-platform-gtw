import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardService } from './dashboard.service';
import { PlaygroundService } from '../playground/playground.service';
import { CurrentDTO } from '../playground/current.model';
import { ProjectDTO } from './project.model';
import { TeamDTO } from './team.model';
import { CurrentComponentDTO } from '../playground/current-components.model';
import { Account } from '../core/user/account.model';
import { NotificationService } from '../shared/notification/notification.service';
import { Option } from '@angular/cli/models/command';
import { NotificationDTO } from '../shared/notification/notification.model';
import { Subscription } from 'rxjs/Rx';
import { TeamRequestDTO } from './team-request.model';
import { WsMessageService } from '../shared/tracker/ws-message.service';

@Component({
    selector: 'hjl-dashboard',
    templateUrl: './dashboard.component.html',
    host: {
        class: 'fullpage-router'
    }
})
export class DashboardComponent implements OnInit, OnDestroy {
    formToggled = '';
    publicApiForm: FormGroup;
    dsbMenuOpen = true;

    //
    activeProject: ProjectDTO;
    activeTeam: TeamDTO;
    current: CurrentDTO;
    about;
    baseProjectName;
    baseTeamName;
    activeDsbMenu;
    teamRole;
    customTemplateComponents;
    invites: NotificationDTO[];
    init;
    subscriptions: Subscription[];
    teamRequests: TeamRequestDTO[];

    form = {
        notif: null
    };
    activities: any[] = [];

    nexusTemplateComponents: any[];
    templateDsbContentMessage = '';
    constructor(
        private dashboardService: DashboardService,
        private notificationService: NotificationService,
        private ws1MessageService: WsMessageService,
        private playgroundService: PlaygroundService
    ) {
        // let jsonInvites = window.localStorage.getItem("dsb--invites");
        this.invites = [];
        this.teamRequests = [];
        this.nexusTemplateComponents = playgroundService.getMockTemplateOutputs();
        console.log('init invites from session:', this.invites);
        this.subscriptions = [];
        this.subscriptions.push(
            dashboardService.currentEventEmitter.subscribe(curr => {
                if (curr) {
                    console.log('Current Evnet Emitter - setting DashboardComponent current', curr);
                    this.current = curr;
                }
            })
        );
        this.subscriptions.push(
            dashboardService.projectEventEmitter.subscribe(curr => {
                if (curr) {
                    console.log('Project Evnet Emitter - setting DashboardComponent Project', curr);
                    this.activeProject = curr;
                    this.baseProjectName = this.activeProject ? this.activeProject.name : 'Project001';
                    this.init = true;
                }
            })
        );
        this.subscriptions.push(
            dashboardService.teamEventEmitter.subscribe(curr => {
                console.log('Team Evnet Emitter - setting DashboardComponent Team', curr);
                if (curr) {
                    this.activeTeam = curr;
                    this.teamRequests = curr.teamRequests;
                    this.teamRole = JSON.stringify(
                        this.activeTeam.groups.filter(s => s.users.some(s => s === this.dashboardService.account.login)).map(s => s.name)
                    );
                    this.baseTeamName = this.activeTeam.name;
                }
            })
        );
        //todo check if notif was already read
        this.subscriptions.push(
            notificationService.technicalEventEmitter.subscribe(notifs => {
                if (notifs) {
                    console.log('received technical notifs from notifservice', notifs);
                    notifs.forEach(notif => {
                        switch (notif.name) {
                            case 'invite_team':
                                console.log('Got invite notif ! Pushing to invites', notifs, this.invites);
                                this.subscriptions.push(
                                    this.dashboardService.getTeam(notif.value).subscribe(b64 => {
                                        console.log('sub0', b64);
                                        let team = TeamDTO.fromBase64(b64['base64']);
                                        notif.value = team.name;
                                        notif.meta = team;
                                        notif.built = true;
                                        this.invites.push(notif);
                                    })
                                );
                                break;
                            case 'component-request':
                                console.log('Received component request', notif);
                                let req: TeamRequestDTO = JSON.parse(notif.value);
                                console.log('Parsed to requestDTO', req);
                                let ret = this.teamRequests.filter(req2 => req2.id != req.id);
                                ret.push(req);
                                this.teamRequests = ret;
                            // window.localStorage.setItem("dsb--invites", JSON.stringify(this.invites))//TODO;
                        }
                    });
                }
            })
        );
    }

    ngOnInit() {
        if (!this.dashboardService.init) {
            setTimeout(() => (this.init = true), 700); //TODO
        } else {
            this.init = true;
        }

        //TODO ws1 websocket => use tec ws instead
        this.ws1MessageService.connect('ws1').then(queue => {
            this.activities = queue;
        });
        this.ws1MessageService.subscribe('/message/out');

        this.ws1MessageService.receive().subscribe(message => {
            this.displayMessages(message);
        });
    }
    ngOnDestroy() {
        console.log('Unsubscribing ' + this.subscriptions.length + ' subs');
        this.subscriptions.forEach(s => s.unsubscribe());
        this.ws1MessageService.unsubscribe('/message/out');
    }
    displayMessages(message: any) {
        this.activities.push(message);
    }
    //save after 2 seconds of no-update
    _updateProjectNameIdx = 0;
    updateProjectName(name) {
        this._updateProjectNameIdx++;
        this.current.projectDisplayName = name;
        this.activeProject.name = name;
        setTimeout(() => {
            this._updateProjectNameIdx--;
            if (this._updateProjectNameIdx <= 0) {
                this._updateProjectNameIdx = 0;
                this.baseProjectName = this.activeProject.name;
                console.log('1012---updateProjectName - saving', this.activeProject);
                this.saveCurrent();
                this.saveProject();
                console.log('1012---updateProjectName - saved');
            }
        }, 2000);
    }
    _updateTeamNameIdx = 0;
    updateTeamName(name) {
        this._updateTeamNameIdx++;
        this.current.teamDisplayName = name;
        this.activeTeam.name = name;
        setTimeout(() => {
            this._updateTeamNameIdx--;
            if (this._updateTeamNameIdx <= 0) {
                this._updateTeamNameIdx = 0;
                this.baseTeamName = this.activeTeam.name;
                console.log('1012---updateTeamName - saving', this.activeTeam);
                this.activeProject.teams.filter(t => t.id === this.activeTeam.name)[0] = this.activeTeam;
                this.saveCurrent();
                this.saveTeam();
                this.saveProject();
                console.log('1012---updateTeamName - saved');
            }
        }, 2000);
    }
    saveProject() {
        this.dashboardService.setActiveDashboardProject(this.activeProject);
        this.subscriptions.push(this.dashboardService.saveProject().subscribe()); ///TODO
    }
    saveCurrent() {
        this.dashboardService.setCurrent(this.current);
        this.subscriptions.push(this.dashboardService.saveCurrentDTO().subscribe()); ///TODO
    }
    saveTeam() {
        this.activeProject.teams.filter(t => t.id === this.activeTeam.name)[0] = this.activeTeam;
        console.log('Saving team and poject', this.activeProject);
        //DEBUG
        this.saveProject();

        this.dashboardService.setActiveDashboardTeam(this.activeTeam);
        this.subscriptions.push(this.dashboardService.saveTeam().subscribe()); ///TODO
    }
    startNewTeam() {
        console.log('start new team');
        this.baseTeamName = 'New Team 01';
        this.activeTeam = TeamDTO.build(this.baseTeamName, this.dashboardService.account.login, this.current.project);
        if (this.activeTeam) {
            this.teamRole = this.activeTeam.groups.filter(s => s.users.some(s => s === this.dashboardService.account.login));
        }
        this.current.team = this.activeTeam.id;
        this.current.teamDisplayName = this.activeTeam.name;
        this.activeProject.teams.push(this.activeTeam);
        console.log('start new team after', this.activeTeam);

        this.saveCurrent();
        this.saveProject();
        this.saveTeam();
    }

    startNewProject() {
        this.baseProjectName = 'New Project 01';
        this.activeProject = ProjectDTO.build(this.baseProjectName, this.dashboardService.account.login);
        if (!this.current) {
            this.current = this.dashboardService.currentDTO;
            if (this.activeProject) {
                this.baseProjectName = this.activeProject.name;
            }
            console.log('INIT CURR 2 ', this.current);
        }
        this.current.projectDisplayName = this.activeProject.name;
        this.current.project = this.activeProject.id;
        this.current.projects.push({
            projectId: this.activeProject.id,
            components: CurrentComponentDTO.build()
        });
        this.saveCurrent();
        this.saveProject();
        this.dashboardService.setActiveDashboardProject(this.activeProject);
    }

    setActiveDsbMenu(div, menu) {
        let str = '';
        div.classList.forEach(cl => (str += '.' + cl));
        let items = div.parentElement.querySelectorAll(str);

        [].slice.call(items).forEach(item => {
            item.classList.remove('active');
        });
        div.classList.add('active');
        this.activeDsbMenu = menu;
    }

    activeHolder = {};
    setActiveGeneric(div, property, value) {
        let items = div.parentElement.children;
        [].slice.call(items).forEach(item => {
            item.classList.remove('active');
        });
        div.classList.add('active');
        this.activeHolder[property] = value;
    }

    addUserToTeamGroup(group) {
        let user = prompt('user login'); //TODO
        group.users = group.users.filter(s => s != user);
        group.users.push(user);
        this.activeTeam.users = group.users;
        this.saveTeam();
        this.subscriptions.push(this.dashboardService.addTeamUser(user).subscribe(s => console.log('user added ' + s)));
    }
    removeUserFromTeamGroup(group: { name: string; users: string[] }, user) {
        console.log('removing user', arguments);
        group.users = group.users.filter(s => s != user);
        this.activeTeam.users = group.users; //TODO what if user in multiple groups.. is activeTeam.users useful ?
        this.saveTeam();
        this.subscriptions.push(this.dashboardService.removeTeamUser(user).subscribe(s => console.log('user removed ' + s)));
    }
    addTeamGroup() {
        this.activeTeam.groups.push({
            name: prompt('group name'),
            users: []
        });
        this.saveTeam();
    }

    joinTeam(teamId) {
        console.log('join team', teamId); //TODO
        //load project
        this.subscriptions.push(
            this.dashboardService.getTeam(teamId).subscribe(base64Team => {
                console.log('RECEIVED DATA--', base64Team);
                let team = TeamDTO.fromBase64(base64Team['base64']);
                console.log('RECEIVED TEAM--', team);
                this.activeTeam = team;
                this.teamRequests = team.teamRequests;
                this.current.team = team.id;
                this.current.teamDisplayName = team.name;
                this.baseTeamName = team.name;
                this.subscriptions.push(
                    this.dashboardService.getProject(team.project).subscribe((base64Proj: ProjectDTO) => {
                        let proj = ProjectDTO.fromBase64(base64Proj['base64']);
                        console.log('RECEIVED PROJECT--', proj);
                        this.current.project = proj.id;
                        this.current.projectDisplayName = proj.name;
                        let comp = {
                            projectId: proj.id,
                            components: CurrentComponentDTO.build()
                        };
                        this.current.projects.push(comp);
                        this.activeProject = proj;
                        this.baseProjectName = proj.name;
                        this.saveCurrent();
                    })
                );
            })
        );
        //set current
    }
    openProject(projectId) {
        console.log('open project', projectId); //TODO
        //load project
        this.subscriptions.push(
            this.dashboardService.getProject(projectId).subscribe(base64 => {
                let proj = ProjectDTO.fromBase64(base64['base64']);
                this.current.project = proj.id;
                this.current.projectDisplayName = proj.name;

                this.updateCurrentProjectsComponent(proj.id, proj.name, CurrentComponentDTO.build());

                if (proj.teams && proj.teams.length > 0) {
                    this.activeTeam = proj.teams[0]; //TODO no active team if multiple
                    this.teamRequests = this.activeTeam.teamRequests;
                    this.current.team = this.activeTeam.id;
                    this.current.teamDisplayName = this.activeTeam.name;
                    this.dashboardService.setActiveDashboardTeam(this.activeTeam);
                }

                this.activeProject = proj;
                this.baseProjectName = proj.name;
                this.dashboardService.setActiveDashboardProject(proj);

                this.saveCurrent();
            })
        );
        //set current
    }

    updateCurrentProjectsComponent(projectId: string, projectDisplayName: string, comp: CurrentComponentDTO) {
        let comps = this.current.projects.filter(s => s.projectId != projectId);
        comps.push({
            projectId: projectId,
            projectDisplayName: projectDisplayName,
            components: comp
        });
        this.current.projects = comps;
    }

    close() {
        //TODO check if projectId is already in projects
        this.updateCurrentProjectsComponent(this.current.project, this.current.projectDisplayName, this.current.components);
        this.current.components = CurrentComponentDTO.build();
        this.activeProject = null;
        this.activeTeam = null;
        this.current.project = null;
        this.current.projectDisplayName = null;
        this.current.team = null;
        this.current.teamDisplayName = null;
        this.dashboardService.setActiveDashboardProject(null);
        this.dashboardService.setActiveDashboardTeam(null);
        this.saveCurrent();
    }

    sendTeamRequest() {
        console.log('SENDING TEAM REQUEST', this.form.notif, this.form.notif.group);
        //build the request
        let req = TeamRequestDTO.build(
            this.dashboardService.account.login,
            this.form.notif.group,
            this.form.notif.view,
            parseInt(this.form.notif.priority),
            this.form.notif.name,
            this.form.notif.text
        );
        /*   let req3 = TeamRequestDTO.build(
            "Bob_The_Analyst",
            "front-devs",
            "template",
            1,
            "scatter chartist component",
            "I need a component like chartist-linear but that adds momentjs datetime as x"
        )
        let req2 = TeamRequestDTO.build(
            "Bob_The_Analyst",
            "back-devs",
            "pipeline",
            1,
            "reduce array custom",
            "I need a python component that reduce arrays by doing the mean 2 by 2"
        )*/
        //add the request to the team
        let ret = this.activeTeam.teamRequests.filter(req2 => req2.id != req.id);
        ret.push(req);
        this.teamRequests = ret;
        this.activeTeam.teamRequests = ret;

        let users = this.activeTeam.groups.filter(s => s.name === this.form.notif.group)[0].users;
        //save the team

        this.saveTeam();
        //TODO notify the team users by websocket + notif

        for (let user of users) {
            if (user != this.dashboardService.account.login) {
                let notif = NotificationDTO.buildTec(user, 'component-request', JSON.stringify(req));
                this.notificationService.sendNotificationWS(notif);
            }
        }
        this.form.notif = null;
    }

    //Temp
    onEnteredMessage($event) {
        console.log('entered', $event);
        this.ws1MessageService.sendWs1Message($event, this.dashboardService.account);
    }

    //TODO save etc
    handleReq(req: TeamRequestDTO) {
        req.handledBy = this.dashboardService.account.login;
    }

    isCurrentUserInGroup(group): boolean {
        console.log('perf-isCurrentUserInGroup');
        return this.activeTeam.groups.filter(g => (g.name = group))[0].users.indexOf(this.dashboardService.account.login) >= 0;
    }

    addTemplateComponentCallback;
    addTemplateComponentToCurrent() {
        this.templateDsbContentMessage = 'Click on a component to add it to current';
        this.addTemplateComponentCallback = comp => {
            this.current.components.templateComponents.push(comp);
            this.saveCurrent();
        };
    }
    addTemplateComponentToTeam() {
        this.templateDsbContentMessage = 'Click on a component to add it to team';
        this.addTemplateComponentCallback = comp => {
            this.activeTeam.templateComponents.push(comp);
            this.saveTeam();
        };
    }
    addTemplateComponentToProject() {
        this.templateDsbContentMessage = 'Click on a component to add it to project';
        this.addTemplateComponentCallback = comp => {
            this.activeProject.templateComponents.push(comp);
            this.saveProject();
        };
    }
    addTemplateComponentToNexus() {
        this.templateDsbContentMessage = 'Click on a component to add it to nexus';
        this.addTemplateComponentCallback = comp => {
            this.nexusTemplateComponents.push(comp); //TODO
        };
    }
    addTemplateComponent(comp) {
        this.addTemplateComponentCallback(comp); //TODO
        this.templateDsbContentMessage = 'component added !';
    }
}
