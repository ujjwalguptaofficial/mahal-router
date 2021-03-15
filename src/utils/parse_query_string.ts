export const parseQuery = (qs: string) => {
    var query = {};
    var pairs = (qs[0] === '?' ? qs.substr(1) : qs).split('&');
    for (let i = 0, len = pairs.length; i < len; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}