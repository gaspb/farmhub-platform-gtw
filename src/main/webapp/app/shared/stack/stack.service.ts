import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

@Injectable()
export class StackService {
    constructor(private router: Router) {
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                console.log(event.url);
            }
        });
    }
    /*
    connect(){
        console.log("-------------------------CONNECTION----------------------------------");
        const promise = Promise;
        this.router.events.subscribe(event => {
            if(event instanceof NavigationStart) {
                console.log(">>>>>>>>>>>>debug9 - ", event.url);
                console.log("debug10 ", Routes[event.url]);
                return new Promise.resolve(Routes[event.url]);
            }
        });
    }
*/
}
