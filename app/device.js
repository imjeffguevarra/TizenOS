/* Public Tizen application APIs. No Mac server, network address or credentials. */
(function () {
  'use strict';
  var IDS = {
    stremio: 'IkWsFHtOY9.Stremio', netflix: 'org.tizen.netflix-app',
    disneyplus: 'MCmYXNxgcu.DisneyPlus', youtube: '9Ur5IzDKqV.TizenYouTube',
    appletv: 'com.samsung.tv.aria-video', primevideo: 'org.tizen.primevideo',
    abciview: 'mWK87Xghap.ABCiview', sbs: 'OyE7OuxlUi.SBSOnDemand',
    applemusic: 'org.tizen.apple.apple-music',
    moonlight: 'MoonLightS.MoonlightWasm',
    tizenbrew: 'xvvl3S1bvH.TizenBrewStandalone',
    nuviotv: 'NuvioTV001.NuvioTV',
    nuvio_legacy: 'NuvioTV002.Nuvio',
    spotify: 'rJeHak5zRg.Spotify'
  };
  var STREAMING = ['as6cYRgkPy.Binge', '73iTZRTc34.Stan', '5b8c3eb16b.BeamCTVDev',
    'KaLitts8bq.tenplaySamsungTizen', 'eYuOiOLYQX.KayoSports', 'Ne2ZsPWdKl.9NOW',
    '3KA0pm7a7V.TubiTV', 'rJeHak5zRg.Spotify', 'icp4AvUPiA.7plus'];
  var CONSUMER_SYSTEM = ['org.tizen.browser', 'org.tizen.netflix-app', 'com.microsoft.copilot', 'HEPsqFNie0.tvplusstandalone'];
  var EXTRA_BRANDS = {
    'rJeHak5zRg.Spotify': 'spotify',
    '5b8c3eb16b.BeamCTVDev': 'hbomax',
    '3KA0pm7a7V.TubiTV': 'tubi',
    'vYmY3ACVaa.emby': 'emby',
    'kIciSQlYEM.plex': 'plex',
    '7wiJRozgP7.VieOn': 'vieon',
    'OxWOiJOOyr.vtv': 'vtv',
    'GHI3a0zMSx.XboxGamePass': 'xbox',
    'NuvioTV001.NuvioTV': 'nuviotv',
    'NuvioTV002.Nuvio': 'nuvio_legacy'
  };
  var CLEAN_TITLES = {
    'OxWOiJOOyr.vtv': 'VTVgo',
    'kIciSQlYEM.plex': 'Plex',
    'xvvl3S1bvH.TizenBrewStandalone': 'TizenBrew',
    'rJeHak5zRg.Spotify': 'Spotify',
    'HEPsqFNie0.tvplusstandalone': 'Samsung TV Plus',
    'CmeyUlnhYY.LunaWebApp': 'Amazon Luna',
    'GHI3a0zMSx.XboxGamePass': 'Xbox',
    'w0wZu3xkQq.GeForceNOW': 'GeForce NOW',
    '25emanual1.emanual': 'Hướng dẫn sử dụng',
    'NuvioTV001.NuvioTV': 'Nuvio Web',
    'NuvioTV002.Nuvio': 'Nuvio Native'
  };
  var INTERNAL = ['adplatform.ADPlayer', 'WykOS4t4F0.cmsWebApp', '25emanual3.emanual',
    'ZODRT12q2l.WebAccountExtension', 'ByJlgt0XeD.CastSettingsApp', 'tv6pbVMQFF.PrivacyChoices'];
  var SELF = 'nClrkHome1.FrameHome';
  function api() { return window.tizen && window.tizen.application; }
  function unavailable(done) {
    done({ message: 'Open CleanFrame on the TV to use this control.', detail: 'The web preview cannot control the TV.' });
  }
  function failure(err) {
    return { message: 'The TV could not open this screen.', detail: err && (err.message || err.name) || 'Try again, or press the remote’s Home button to return to CleanFrame.' };
  }
  function bounded(done) {
    var finished = false, timer = setTimeout(function () { finish({ message: 'The TV did not respond. Please try again.' }); }, 8000);
    function finish(err, value) { if (finished) return; finished = true; clearTimeout(timer); done(err, value); }
    return finish;
  }
  function launchApp(id, done) {
    if (typeof id === 'string' && id.indexOf('hdmi:') === 0) {
      var port = parseInt(id.replace('hdmi:', ''), 10) || 1;
      hdmi(port, done);
      return;
    }
    if (id === 'source') { source(done); return; }
    if (!api()) { unavailable(done); return; }
    var finish = bounded(done);
    try { api().launch(id, function () { finish(null); }, function (err) { finish(failure(err)); }); }
    catch (err) { finish(failure(err)); }
  }
  function launch(brand, done) {
    if (!IDS[brand]) { done({message: 'This app has no launch target.'}); return; }
    launchApp(IDS[brand], done);
  }
  var SAMSUNG_VIEWER = 'org.tizen.tv-viewer';
  function hdmi(port, done) {
    if (!api()) { unavailable(done); return; }
    var finish = bounded(done);
    var targetNumber = Number(port) || 1;
    function showViewer() {
      try {
        api().launch(SAMSUNG_VIEWER, function () {
          finish(null);
        }, function () {
          try {
            if (window.tizen.application && window.tizen.application.getCurrentApplication) {
              window.tizen.application.getCurrentApplication().hide();
            }
          } catch (e) {}
          finish(null);
        });
      } catch (e) {
        finish(null);
      }
    }
    try {
      if (window.tizen && window.tizen.systeminfo && window.tizen.tvwindow) {
        window.tizen.systeminfo.getPropertyValue('VIDEOSOURCE', function (v) {
          var sources = v && v.connected ? v.connected : [];
          var source = null;
          for (var i = 0; i < sources.length; i++) {
            if (sources[i].type === 'HDMI' && Number(sources[i].number) === targetNumber) {
              source = sources[i];
              break;
            }
          }
          if (source) {
            window.tizen.tvwindow.setSource(source, function () {
              showViewer();
            }, function () {
              showViewer();
            });
          } else {
            showViewer();
          }
        }, function () {
          showViewer();
        });
      } else {
        showViewer();
      }
    } catch (err) {
      showViewer();
    }
  }
  function sources(done) {
    try {
      if (window.tizen && window.tizen.systeminfo) {
        window.tizen.systeminfo.getPropertyValue('VIDEOSOURCE', function (v) {
          var connected = v && v.connected ? v.connected : [];
          done(connected);
        }, function () {
          done([]);
        });
        return;
      }
    } catch (e) {}
    done([]);
  }
  function source(done) { hdmi(1, done); }
  function art(done) {
    if (!api()) { unavailable(done); return; }
    var finish = bounded(done);
    try {
      var data = [new tizen.ApplicationControlData('mode', ['fullscreen']), new tizen.ApplicationControlData('requester', ['mobile'])];
      var control = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/default', null, null, null, data);
      api().launchAppControl(control, 'org.tizen.art-app', function () { finish(null); }, function (err) { finish(failure(err)); });
    } catch (err) { finish(failure(err)); }
  }
  function home(done) { launchApp('com.samsung.tv.csfs', done); }
  function settings(done) { launchApp('com.samsung.tv.coba.setting', done); }
  function apps(done) {
    if (!api()) { unavailable(done); return; }
    var finish = bounded(done);
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
          var cleanName = CLEAN_TITLES[a.id] || a.name;
          result.push({ appId: a.id, name: cleanName, brand: known[a.id] || EXTRA_BRANDS[a.id] || '', icon: a.iconPath || '', rank: primary ? Object.keys(IDS).indexOf(known[a.id]) : (stream ? 20 : 30) });
        });
        result.sort(function (a, b) { return a.rank - b.rank || a.name.toLowerCase().localeCompare(b.name.toLowerCase()); });
        finish(null, result);
      }, function (err) { finish(failure(err)); });
    } catch (err) { finish(failure(err)); }
  }
  window.FrameDevice = { launch: launch, launchApp: launchApp, art: art, source: source, hdmi: hdmi, sources: sources, home: home, settings: settings, apps: apps, brands: EXTRA_BRANDS, titles: CLEAN_TITLES };
}());
