import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardService } from './dashboard.service';

@Component({
    selector: 'hjl-dashboard',
    templateUrl: './dashboard.component.backup.html',
    host: {
        class: 'fullpage-router'
    }
})
export class DashboardComponent implements OnInit {
    formToggled = '';
    publicApiForm: FormGroup;
    microserviceForm: FormGroup;
    msApiDocForm: FormGroup;

    //
    activeProject;

    constructor(private _fb: FormBuilder, private dashboardService: DashboardService) {}

    startNewProject() {
        this.activeProject = {};
        this.dashboardService.setActiveDashboardProject(this.activeProject);
    }

    ngOnInit() {
        this.activeProject = this.dashboardService.activeDashboardProject;

        // Public Api Form
        this.publicApiForm = this._fb.group({
            name: ['', [Validators.required, Validators.minLength(5)]],
            URL: [''],
            desc: [''],
            rest: [''],
            input: this._fb.group({
                type: ['string', Validators.required],
                desc: ['']
            }),
            output: this._fb.group({
                type: ['string', Validators.required],
                desc: ['']
            }),
            _params: this._fb.array([])
        });

        // MS Form (== RouteVM java)
        /**
         * 1) Declare a new MSDTO (+ private path)
         * 2) Declare the APIs
         * 3) Impossible to change the private path of the MSDTO, but always possible to edit or add an APIDOC.
         * APIDOC don't have the private path of the MS and so can display the real path of the API securely
         * => use MSDTO/APIDOC or generate a MSDTO/APIDOC from the form ? Knowing that more infor are in the formgroup than in the MSDTO/APIDOC,
         * as these DTOs are used in the PG
         */
        this.microserviceForm = this._fb.group({
            realBaseURL: ['', Validators.required],
            fakePath: ['', Validators.required],
            confidentiality: ['', Validators.required],
            privateServiceId: ['', Validators.required],
            displayName: ['', Validators.required],
            serviceInstances: [],
            //gtwProperties ??
            apis: []
        });

        this.msApiDocForm = this._fb.group({
            realPath: ['', Validators.required],
            fakePath: ['', Validators.required], // remove ? or maybe show both
            model: ['', Validators.required], // Different API models are available, starting with HTTP and HTTPS.
            headers: ['', Validators.required], //possibility to include an auth/JWT key , TODO CSRF handling
            description: ['', Validators.required],
            fetchType: ['', Validators.required], //one time/stream/observable
            inputType: ['', Validators.required],
            inputAdvices: ['', Validators.required],
            outputType: ['', Validators.required],
            outputAdvices: ['', Validators.required],
            parentMS__privateServiceId: ['', Validators.required]
        });
    }

    private saveApiForm(form) {
        console.log('SAVE API FORM2', form);
        //call service
        this.dashboardService.savePublicApi(form.value).subscribe(bool => console.log('RETURNED ' + bool));
    }

    private toggleMsForm(name) {
        this.formToggled = name;
    }

    initParams() {
        // initialize our address
        return this._fb.group({
            name: [''],
            _default: [''],
            _mandatory: [true],
            desc: [''],
            _editable: [true]
        });
    }

    addApiParam() {
        const control = <FormArray>this.publicApiForm.controls['_params'];
        if (!control) {
            this.publicApiForm.controls['_params'] = this._fb.array([this.initParams()]);
        } else {
            control.push(this.initParams());
        }
    }

    removeApiParam(i: number) {
        // remove address from the list
        const control = <FormArray>this.publicApiForm.controls['_params'];
        control.removeAt(i);
    }
}
