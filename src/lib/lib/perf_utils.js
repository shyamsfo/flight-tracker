import nu_log from 'loglevel';

class NuPerfTimer {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        if (this.description == null) {
            this.description = this.name;
        }
    }
    static begin(name) {
        let x = new NuPerfTimer(name);
        x.start();
        return x;
    }
    start() {
        this.s = performance.now();
        return this.s;
    }
    stop(log_it=true) {
        this.e = performance.now();
        this.t = this.e - this.s;
        if (log_it) {
            nu_log.debug(`NuPerfTime : ${this.name} : ${this.t.toFixed(3)} milliseconds`);
        }
        let obj = {name: this.name, description: this.description, time: this.t.toFixed(3)};
        window.nu_perf_timers = [obj, ...window.nu_perf_timers];
        return this.t;
    }

    static timer(name) {
        let xx = new NuPerfTimer(name);
        xx.start();
        return xx;
    }
}

function random_str() {
    return (Math.random() + 1).toString(36).substring(2);
}


class PerfUtils {
    constructor() {
        this.all_timers = {};
    }
    start(name, description) {
        let xx = random_str();
        let x = new NuPerfTimer(name, description);
        x.start();
        this.all_timers[xx] = x;
        return xx;
    }
    stop(xx, do_log=false) {
        let y = this.all_timers[xx];
        y.stop(do_log)
        delete this.all_timers[xx];
        return y.t;
    }
}

let perf_utils = new PerfUtils();
if (!window.nu_perf_timers) {
    window.nu_perf_timers = [];
}

export default perf_utils;