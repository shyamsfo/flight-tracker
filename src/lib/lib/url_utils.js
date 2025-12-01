import nu_log from "loglevel";
import nu_perf from './perf_utils.js';

async function fetch_url_internal(url) {
    let prf = nu_perf.start('url_fetch');
    let resp = await fetch(url);
    if (!resp.ok) {
        let xx = `url fetch failed : ${resp.status}`;
        throw xx;
    }
    nu_perf.stop(prf);
    nu_log.debug(`fetch_url: ${url} : Total size: ${resp.headers.get("content-length")}`);
    return resp;
}

async function fetch_url_text(url) {
    let resp = await fetch_url_internal(url);
    let length = resp.headers.get("content-length");
    let data = await resp.text();
    return {data, length};
}
async function post_url_json(url, json_inp) {
    let our_body = JSON.stringify(json_inp);
    const response = await fetch(url, {
        method: 'POST',
        body: our_body
    });
    const jsonText = await response.json();
    console.log(jsonText);
    return jsonText;
}

async function fetch_url_json(url) {
    let resp = await fetch_url_internal(url);
    let length = resp.headers.get("content-length");
    let json = await resp.json();
    return {json, length};
}

async function test_me() {

let xx = await url_utils.fetch_url_json('https://laptop-redirect.nuwire.co/data/demo_dashboards.json');
sf_utils.debug_obj(xx);

xx = await url_utils.fetch_url_text('https://laptop-redirect.nuwire.co/data/tips.csv');
sf_utils.debug_obj(xx);

}

let ex = {
    fetch_url_text,
    fetch_url_json,
    post_url_json,
    test_me,
}

export default ex;