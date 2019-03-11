export class NotificationDTO {
    built: false;
    meta;
    constructor(
        public fromUser: string,
        public toUser: string,
        public type: string,
        public name: string,
        public value: string,
        public icon: string,
        public text: string
    ) {}

    static buildTec(toUser: string, name: string, value: string): NotificationDTO {
        return new NotificationDTO('', toUser, 'tec', name, value, '', '');
    }

    getBase64(): string {
        //TODO
        return btoa(JSON.stringify(this, null, 4));
    }
    static fromBase64(binary: string): NotificationDTO {
        return JSON.parse(atob(binary)); //todo use custom parser
    }
}
