export const circularSafeStringify = function(v) {
    const cache = {};
    return JSON.stringify(v, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache[value]) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our map
            cache[value] = true;
        }
        return value;
    });
};
export const stringifyIgnoringKey = function(obj, k) {
    return JSON.stringify(obj, function(key, value) {
        if (key === k) {
            return;
        }
        return value;
    });
};
