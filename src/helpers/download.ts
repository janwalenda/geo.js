/**
 * Downnload action with any url
 * @param {*} url Any URL
 * @param {*} filename the downloaded file will have this name
 */
export function download(url: string, filename: string): void
{
    const a = document.createElement("a");
    a.download = filename || Date.now() + '';
    a.href = url;
    
    document.documentElement.appendChild(a);
    a.click();
    a.remove();
}