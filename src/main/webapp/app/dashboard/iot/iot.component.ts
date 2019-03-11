import { Component, OnInit } from '@angular/core';
@Component({
    selector: 'hjl-iot',
    templateUrl: './iot.component.html'
})
export class IotComponent implements OnInit {
    about = false;
    sensors: Sensor;
    constructor() {}

    ngOnInit() {}
}
