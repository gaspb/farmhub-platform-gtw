export const downloadAsFile = (data: any, filename?: string, mimetype?: string) => {
    console.log('downloadAsFile', data);
    if (!data) return;
    let blob = new Blob([JSON.stringify(data, null, 6)], { type: mimetype || 'application/octet-stream' });

    /*data.constructor !== Blob
        ? new Blob([data.constructor.name == 'Object' ? JSON.stringify(data, null, 6) : data], { type: mimetype || 'application/octet-stream' })
        : data;*/

    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
        return;
    }

    let lnk = document.createElement('a'),
        url = window.URL,
        objectURL;

    if (mimetype) {
        lnk.type = mimetype;
    }

    lnk.download = filename || 'untitled';
    lnk.href = objectURL = url.createObjectURL(blob);
    lnk.dispatchEvent(new MouseEvent('click'));
    setTimeout(url.revokeObjectURL.bind(url, objectURL));
};
