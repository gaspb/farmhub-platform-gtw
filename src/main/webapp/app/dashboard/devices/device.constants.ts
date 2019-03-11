export class DeviceConstants {
    LEADERSHIP_SCALE_SINGLE_NODE = 0;
    LEADERSHIP_SCALE_DISTRIBUTED = 1;
    UpdatePolicies = {
        WEB_SYNC: 0,
        WEB_LOCAL: 1, //import json through embedded webapp
        APP_LOCAL: 2 //as above but through external android/chrome (be on internet, charge json in cache, connect to local network, retrieve json from cache)
    };
}
