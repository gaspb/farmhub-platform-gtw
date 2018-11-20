import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';

@Injectable()
export class CSRFService {
    constructor(private cookieService: CookieService) {}

    getCSRF(name?: string) {
        name = `${name ? name : 'XSRF-TOKEN'}`;
        let cc: String = this.cookieService.get(name);

        return cc ? cc : '';
    }
}
