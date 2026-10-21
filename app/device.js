/* Public Tizen application APIs. No Mac server, network address or credentials. */
(function () {
  'use strict';
  var IDS = {
    stremio: 'IkWsFHtOY9.Stremio', netflix: 'org.tizen.netflix-app',
    disneyplus: 'MCmYXNxgcu.DisneyPlus', youtube: '9Ur5IzDKqV.TizenYouTube',
    appletv: 'com.samsung.tv.aria-video', primevideo: 'org.tizen.primevideo',
    abciview: 'mWK87Xghap.ABCiview', sbs: 'OyE7OuxlUi.SBSOnDemand',
    applemusic: 'org.tizen.apple.apple-music'
  };
  var STREAMING = ['as6cYRgkPy.Binge', '73iTZRTc34.Stan', '5b8c3eb16b.BeamCTVDev',
    'cj37Ni3qXM.HBONow', 'LBUAQX1exg.Hulu', 'gzcc4LRFBF.Peacock', 'rJyOSqC6Up.CBSAllAccess',
    'Rk72oKFsRS.OtterKidsProd', '70fRFUwYlD.OtterGAProd', 'PvWgqxV3Xa.YouTubeTV',
    'XtU8fQk2gN.ESPN', 'ZmmGjO6VKO.slingtv', 'VtuWAiZdHN.STARZPlay', 'ckfgqqzvt0.dplus',
    'kk8MbItQ0H.VUDU', 'Jz7aUrV2Q4.Twitch', 'OK2Rdkjmsi.IMDbTV', 'Ob3XhAVMu6.amcplus',
    'KaLitts8bq.tenplaySamsungTizen', 'eYuOiOLYQX.KayoSports', 'Ne2ZsPWdKl.9NOW',
    '3KA0pm7a7V.TubiTV', 'rJeHak5zRg.Spotify', 'icp4AvUPiA.7plus'];
  var CONSUMER_SYSTEM = ['org.tizen.browser', 'com.microsoft.copilot'];
  var EXTRA_BRANDS = {'rJeHak5zRg.Spotify': 'spotify', '5b8c3eb16b.BeamCTVDev': 'hbomax', 'cj37Ni3qXM.HBONow': 'hbomax', '3KA0pm7a7V.TubiTV': 'tubi'};
  var INTERNAL = ['adplatform.ADPlayer', 'WykOS4t4F0.cmsWebApp', '25emanual3.emanual',
    'd0m1lV1nt2.emanual', '2022ePop01.SmartTV',
    'ZODRT12q2l.WebAccountExtension', 'ByJlgt0XeD.CastSettingsApp', 'tv6pbVMQFF.PrivacyChoices'];
  var SELF = 'nClrkHome1.FrameHome';
  function api() { return window.tizen && window.tizen.application; }
  function unavailable(done) {
    done({ message: 'Open CleanFrame on the TV to use this control.', detail: 'The web preview cannot control the TV.' });
  }
  function failure(err) {
    return { message: 'The TV could not open this screen.', detail: err && (err.message || err.name) || 'Try again, or press the remote’s Home button to return to CleanFrame.' };
  }
  function bounded(done, ms) {
    var finished = false, timer = setTimeout(function () { finish({ message: 'The TV did not respond. Please try again.' }); }, ms || 8000);
    function finish(err, value) { if (finished) return; finished = true; clearTimeout(timer); done(err, value); }
    return finish;
  }
  function launchApp(id, done) {
    if (!api()) { unavailable(done); return; }
    var finish = bounded(done);
    try { api().launch(id, function () { finish(null); }, function (err) { finish(failure(err)); }); }
    catch (err) { finish(failure(err)); }
  }
  function launchControl(id, pairs, done) {
    if (!api()) { unavailable(done); return; }
    var finish = bounded(done);
    try {
      var data = pairs.map(function (p) { return new tizen.ApplicationControlData(p[0], [p[1]]); });
      var control = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/default', null, null, null, data);
      api().launchAppControl(control, id, function () { finish(null); }, function (err) { finish(failure(err)); });
    } catch (err) { finish(failure(err)); }
  }
  function launch(brand, done) {
    if (!IDS[brand]) { done({message: 'This app has no launch target.'}); return; }
    launchApp(IDS[brand], done);
  }
  function art(done) {
    launchControl('org.tizen.art-app', [['mode', 'fullscreen'], ['requester', 'mobile']], done);
  }
  function home(done) {
    if (window.__tv) { launchApp('com.samsung.tv.csfs', done); return; }
    launchControl('com.samsung.tv.csfs', [['entry_point', 'smarthub_key'], ['switch_page', 'd/media.category']], function (err) {
      if (!err) { done(null); return; }
      launchApp('com.samsung.tv.csfs', done);
    });
  }
  function settings(done) {
    if (window.__tv) { launchApp('com.samsung.tv.coba.setting', done); return; }
    launchControl('org.tizen.menu', [['uri', '/opt/apps/org.tizen.menu/res/json/ATSC/menu.json'], ['__K_EX_FORCE_BOOST', 'enable']], function (err) {
      if (!err) { done(null); return; }
      launchControl('com.samsung.tv.csfs', [['entry_point', 'smarthub_key'], ['switch_page', 'd/menu.category'], ['__COBA_REQUEST_FOCUS_ON__', 's/setting']], function (err2) {
        if (!err2) { done(null); return; }
        launchApp('com.samsung.tv.coba.setting', done);
      });
    });
  }
  function sources(done) {
    launchControl('com.samsung.tv.csfs', [['entry_point', 'smarthub_key'], ['switch_page', 'd/menu.category'], ['__COBA_REQUEST_FOCUS_ON__', 's/source']], function (err) {
      if (!err) { done(null); return; }
      launchApp('org.tizen.connection-guide-app', done);
    });
  }
  var cachedApps = null, warmingApps = null;
  function queryApps(done) {
    var finish = bounded(done, 20000);
    try {
      api().getAppsInfo(function (list) {
        var known = {}, seen = {}, result = [];
        Object.keys(IDS).forEach(function (brand) { known[IDS[brand]] = brand; });
        list.forEach(function (a) {
          var primary = !!known[a.id], stream = STREAMING.indexOf(a.id) >= 0;
          var consumer = /^[A-Za-z0-9]{10}\.[A-Za-z0-9_-]+$/.test(a.id) || CONSUMER_SYSTEM.indexOf(a.id) >= 0;
          if (a.id === SELF || INTERNAL.indexOf(a.id) >= 0 || seen[a.id] || !a.name || (!primary && !stream && (!a.show || !consumer))) return;
          if (!primary && /(?:service|worker|preview|promotion|plugin|launcher|test|sdk|^ep[ -]|factory|daemon)/i.test(a.name + ' ' + a.id)) return;
          if (/-dummy$/.test(a.id) || a.id === 'com.samsung.tv.cobalt-yt') return;
          seen[a.id] = true;
          result.push({ appId: a.id, name: a.name, brand: known[a.id] || EXTRA_BRANDS[a.id] || '', icon: a.iconPath || '', rank: primary ? Object.keys(IDS).indexOf(known[a.id]) : (stream ? 20 : 30) });
        });
        result.sort(function (a, b) { return a.rank - b.rank || a.name.toLowerCase().localeCompare(b.name.toLowerCase()); });
        if (!window.__tv) cachedApps = result;
        finish(null, result);
      }, function (err) { finish(failure(err)); });
    } catch (err) { finish(failure(err)); }
  }
  function apps(done) {
    if (!api()) { unavailable(done); return; }
    if (window.__tv) { queryApps(done); return; }
    if (cachedApps) {
      var snapshot = cachedApps.slice();
      setTimeout(function () { done(null, snapshot); }, 0);
      if (!warmingApps) {
        warmingApps = [];
        queryApps(function () { warmingApps = null; });
      }
      return;
    }
    if (warmingApps) { warmingApps.push(done); return; }
    warmingApps = [done];
    queryApps(function (err, result) {
      var queue = warmingApps ? warmingApps.slice() : [];
      warmingApps = null;
      queue.forEach(function (fn) { fn(err, result ? result.slice() : undefined); });
    });
  }
  if (api() && !window.__tv) setTimeout(function () { apps(function () {}); }, 100);
  window.FrameDevice = { launch: launch, launchApp: launchApp, art: art, home: home, settings: settings, sources: sources, apps: apps };
}());
