import { Component, OnDestroy, OnInit } from '@angular/core';
import { DeviceConstants } from './device.constants';
import { DashboardService } from '../dashboard.service';
import { Subscription } from 'rxjs/Rx';

@Component({
    selector: 'hjl-device',
    templateUrl: './device.component.html'
})
export class DeviceComponent implements OnInit, OnDestroy {
    constants: DeviceConstants;
    openModal;
    modalContent = '';
    modalEditable;

    currDeviceGroup: DeviceGroup;
    deviceGroups: DeviceGroup[];

    subscriptions: Subscription[];

    constructor(private dashboardService: DashboardService) {
        this.constants = new DeviceConstants();
        this.subscriptions = [];
        this.subscriptions.push(
            dashboardService.currentEventEmitter.subscribe(curr => {
                if (curr) {
                    console.log('Current Evnet Emitter - setting DashboardComponent current', curr);
                    this.deviceGroups = curr.deviceGroups;
                }
            })
        );
    }

    ngOnInit() {}
    ngOnDestroy() {
        console.log('Unsubscribing ' + this.subscriptions.length + ' subs');
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    addCurrToDeviceGroups() {
        this.retrieveAllAPIDocs();
        if (!this.deviceGroups) {
            this.deviceGroups = [];
        }
        this.deviceGroups.push(this.currDeviceGroup);
        this.currDeviceGroup = null;
        console.log('dbg', this.deviceGroups);
        this.saveCurrentDevices();
    }

    newDeviceGroup() {
        this.currDeviceGroup = new DeviceGroup();
    }

    addNewIO() {
        this.currDeviceGroup.IO.push({});
    }
    addNewProcessing() {
        this.currDeviceGroup.processing.push({});
    }

    removeFromArr(elem: any, arr: any[]) {
        arr.splice(arr.indexOf(elem), 1);
    }
    editedVal;
    editJSON(jsVal) {
        this.editedVal = jsVal;
        this.modalEditable = true;
        this.openModal = true;
        this.modalContent = this.prettify(jsVal);
    }
    saveModalContent() {
        Object.assign(this.editedVal, JSON.parse(this.modalContent));
        this.openModal = false;
        this.saveCurrentDevices();
    }
    viewJSON(jsVal) {
        this.openModal = true;
        this.modalEditable = false;
        this.modalContent = this.prettify(jsVal);
    }

    prettify(obj) {
        function replacer(key, value) {
            if (value === null) return undefined;
            else return value;
        }

        return JSON.stringify(obj, replacer, 4);
    }

    retrieveAllAPIDocs() {
        this.currDeviceGroup.IO.forEach(io => (io.API = this.retrieveAPIDoc(io.API, io)));
        this.currDeviceGroup.processing.forEach(proc => (proc.API = this.retrieveAPIDoc(proc.API, proc)));
    }
    retrieveAPIDoc(value, obj) {
        switch (value) {
            case 'custom-link':
                let link = obj['_opt-link'];

                let res = this.dashboardService.getApiDocfromURL(link);
                console.log('got apidoc from url ' + link, res);
                return res;
            case 'custom-json':
                let json = JSON.parse(obj['_opt-json']);
                console.log('got apidoc from json ', json);
                return json;
            case 'custom-GUI':
                let json = obj['_opt-GUI'];
                console.log('got apidoc from GUI ', json);
                return json;
            default:
                let res = this.dashboardService.getApiDocProvided(value);
                console.log('got apidoc from provided ' + value, res);
                return res;
        }
    }

    saveCurrentDevices() {
        this.dashboardService.setCurrentDevices(this.deviceGroups);
        this.subscriptions.push(this.dashboardService.saveCurrentDTO().subscribe()); ///TODO
    }
}

export class DeviceGroup {
    static index = 0;
    name: string;
    leadership: {
        scale: number;
        endpoint?: any;
    };
    updatePolicy: number;

    IO: [
        {
            name?;
            UUID?;
            API?;
        }
    ];
    manager: {
        name?;
        UUID?;
        API?;
        ipv4?;
        port?;
    };
    processing: [
        {
            name?;
            UUID?;
            API?;
        }
    ];
    repository: {
        name?;
        UUID?;
        API?;
    };

    constructor() {
        this.name = 'New Device Group #' + DeviceGroup.index;
        DeviceGroup.index = ++DeviceGroup.index;
        this.leadership = {};
        this.manager = {};
        this.repository = {};
        this.IO = [];
        this.processing = [];
    }
}
