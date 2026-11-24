// Chỉ chuyển interstitial của Hexa Merge qua Android; không thay SDK reward.
// Route Hexa Merge interstitials through Android; leave rewarded SDK untouched.
export function installNextaiC3Interstitial(api, host = window) {
    if (!api || !host.AndroidBridge || typeof host.AndroidBridge.requestC3Interstitial !== "function") return false;
    let nextId = 0;
    const pending = new Map();
    api.CreateInterstitialAdvert = async (_unit, _testMode, done) => done(null, "interstitial available");
    api.ShowInterstitialAdvert = async done => {
        if (pending.size) return done("Interstitial already in progress");
        nextId = nextId % 1000000 + 1;
        const id = nextId;
        pending.set(id, done);
        try {
            if (api.suspendRuntime) api.suspendRuntime();
            host.AndroidBridge.requestC3Interstitial(id);
        } catch (_) {
            pending.delete(id);
            if (api.resumeRuntime) api.resumeRuntime();
            done("Interstitial unavailable");
        }
    };
    host.__nextaiC3InterstitialDone = id => {
        const done = pending.get(id);
        if (!done) return;
        pending.delete(id);
        if (api.resumeRuntime) api.resumeRuntime();
        // C3 tiếp tục game cả khi ad bị giới hạn hoặc không có fill.
        // Resume game even when the ad is capped or no fill is available.
        done(null, "interstitial finished");
    };
    return true;
}
