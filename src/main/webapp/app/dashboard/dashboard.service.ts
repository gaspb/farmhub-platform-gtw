import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CurrentDTO } from '../playground/current.model';
import { Principal } from '../core/auth/principal.service';
import { ProjectDTO } from './project.model';
import { Account } from '../core/user/account.model';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { TeamDTO } from './team.model';
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable()
export class DashboardService {
    tempSavedDashboardProject;
    init = false;
    activeDsbTeam: TeamDTO;
    activeDsbProject: ProjectDTO;
    currentDTO: CurrentDTO;
    currentEventEmitter: BehaviorSubject<CurrentDTO>;
    projectEventEmitter: BehaviorSubject<ProjectDTO>;
    teamEventEmitter: BehaviorSubject<TeamDTO>;

    account: Account;
    init = false;
    constructor(private http: HttpClient, private principal: Principal) {
        console.log('INIT DASHBOARDSERVICE INSTANCE');
        this.tempSavedDashboardProject = [];
        console.log('1012-- in dsbserv constructor');

        this.currentEventEmitter = new BehaviorSubject<CurrentDTO>(null);
        this.projectEventEmitter = new BehaviorSubject<ProjectDTO>(null);
        this.teamEventEmitter = new BehaviorSubject<TeamDTO>(null);

        console.log('1012-- in dsbserv constructor+1');
        this.principal.identity().then(account => {
            this.account = account;
            console.log('1012-- in dsbserv constructor+2', this.account, this.account.login);
            this.getCurrentDTO().subscribe(dto => {
                console.log('1012-- in dsbserv constructor+3', dto);
                this.currentDTO = dto && dto['base64'] ? CurrentDTO.fromBase64(dto['base64']) : CurrentDTO.build(this.account.login);

                this.currentEventEmitter.next(this.currentDTO);

                console.log('INITIATED CURRENT', this.currentDTO);

                if (this.currentDTO.project) {
                    this.getProject(this.currentDTO.project).subscribe(dto => {
                        //TODO first() ?
                        console.log('1012-- in dsbserv constructor+4', dto);
                        this.activeDsbProject = ProjectDTO.fromBase64(dto['base64']);
                        if (this.activeDsbProject.teams && this.currentDTO.team) {
                            this.activeDsbTeam = this.activeDsbProject.teams.filter(t => t.id === this.currentDTO.team)[0];
                            this.teamEventEmitter.next(this.activeDsbTeam);
                        }
                        this.init = true;
                        this.projectEventEmitter.next(this.activeDsbProject);
                        console.log('Completed dsb curr---------', this.activeDsbProject, this.activeDsbTeam, this.currentDTO);
                    });
                }
            });
        });
        this.init = true;
    }

    getCurrentDTO() {
        console.log('DEBUG CURRENTDTO account:', this.account);

        return this.http.get('api/dashboard/current', httpOptions).first();
    }
    saveCurrentDTO(current?) {
        console.log('save current dto :', this.currentDTO, current);
        if (current) {
            this.currentDTO = current;
        }
        let curr = this.currentDTO;
        let id = this.account.login + '-projs';
        if (curr.project) {
            let projs = curr.projects.filter(s => s.projectId === curr.project);
            console.log('linkedprojects', projs);
            if (projs && projs.length > 0) {
                console.log('proj0', projs[0]);
                projs[0].components = curr.components;
                id = curr.project;
            }
        }
        let obj = {
            id: id,
            base64: btoa(JSON.stringify(curr))
        };

        return this.http.post('api/dashboard/current/', obj, httpOptions).first();
    }

    getProject(projectId: string) {
        console.log('DBG getProject ', projectId);

        let obj = {
            projectId: projectId
        };

        return this.http.post('api/dashboard/project/id/', JSON.stringify(obj), httpOptions).first();
    }
    saveProject(project?) {
        console.log('save project dto :', this.activeDsbProject, project);
        if (project) {
            this.activeDsbProject = project;
        }
        let obj = {
            id: this.currentDTO.project,
            base64: btoa(JSON.stringify(this.activeDsbProject))
        };

        return this.http.post('api/dashboard/project/', JSON.stringify(obj), httpOptions).first();
    }
    getTeam(teamId: string) {
        console.log('DBG getTeam ', teamId);

        let obj = {
            teamId: teamId
        };

        return this.http.post('api/dashboard/team/id/', JSON.stringify(obj), httpOptions).first();
    }
    saveTeam(team?) {
        console.log('save team dto :', this.activeDsbTeam, team);
        if (team) {
            this.activeDsbTeam = team;
        }

        let obj = {
            id: this.currentDTO.team,
            base64: btoa(JSON.stringify(this.activeDsbTeam))
        };

        return this.http.post('api/dashboard/team/', JSON.stringify(obj), httpOptions).first();
    }

    addTeamUser(userId) {
        console.log('add team user :', this.activeDsbTeam, userId);

        let obj = {
            teamId: this.activeDsbTeam.id,
            userId: userId
        };
        return this.http.post('api/dashboard/team/add/', JSON.stringify(obj), httpOptions).first();
    }
    removeTeamUser(userId) {
        console.log('remove team user :', this.activeDsbTeam, userId);

        let obj = {
            teamId: this.activeDsbTeam.id,
            userId: userId
        };
        return this.http.post('api/dashboard/team/remove/', JSON.stringify(obj), httpOptions).first();
    }

    public savePublicApi(obj) {
        console.log('SAVING API ' + obj.name);
        const body = JSON.stringify(obj);
        console.log(
            'body',
            body
        ); /*
        const headers = new HttpHeaders();
        headers.append( 'Accept', 'application/json');
        headers.append( 'Content-Type', 'application/json')*/
        return this.http.post('playground/public-api/', body, httpOptions);
    }

    public saveDashboardProject(project) {
        this.tempSavedDashboardProject.push(project);
    }
    public setActiveDashboardProject(project) {
        console.log('Setting active dashboard project', project);
        this.activeDsbProject = project;
        this.projectEventEmitter.next(project);
    }
    public setActiveDashboardTeam(team) {
        this.activeDsbTeam = team;
        this.teamEventEmitter.next(team);
    }
    public setCurrent(curr) {
        this.currentDTO = curr;
        this.currentEventEmitter.next(curr);
    }
    public setCurrentDevices(deviceGroups) {
        this.currentDTO.deviceGroups = deviceGroups;
        this.currentEventEmitter.next(this.currentDTO);
    }

    public getApiDocfromURL(apiDocURL) {
        return this.http.get(apiDocURL, httpOptions).first();
    }
    public getApiDocProvided(name) {
        //TODO
        return {
            hi: 'hi',
            im: "i'm",
            mock: 'mock'
        };
    }
}
