/*
 * db.js — Lớp dữ liệu dùng chung cho index / profile / admin.
 * - Có config Firebase hợp lệ  -> dùng Firebase Auth + Firestore (backend thật).
 * - Chưa có config             -> CHẾ ĐỘ DEMO, lưu localStorage của trình duyệt.
 *
 * API:  DB.mode, DB.ready (Promise)
 *       DB.list({publishedOnly})  -> [contractor]
 *       DB.get(id)                -> contractor | null
 *       DB.save(rec)              -> rec (upsert theo rec.id)
 *       DB.remove(id)
 *       DB.onAuth(cb)             -> cb(user|null)
 *       DB.login(email, pw)       -> user  (throw nếu sai)
 *       DB.logout()
 *       DB.currentUser()          -> user | null
 */
(function () {
  var cfg = window.FIREBASE_CONFIG || {};
  var useFirebase = !!(cfg.apiKey && cfg.projectId);
  var FB_VER = "10.12.2";
  var DB = { mode: useFirebase ? "firebase" : "demo" };
  var fb = null;

  DB.ready = (async function init() {
    if (!useFirebase) return;
    var appMod = await import("https://www.gstatic.com/firebasejs/" + FB_VER + "/firebase-app.js");
    var authMod = await import("https://www.gstatic.com/firebasejs/" + FB_VER + "/firebase-auth.js");
    var fsMod = await import("https://www.gstatic.com/firebasejs/" + FB_VER + "/firebase-firestore.js");
    var app = appMod.initializeApp(cfg);
    fb = { app: app, auth: authMod.getAuth(app), fs: fsMod.getFirestore(app), authMod: authMod, fsMod: fsMod };
  })();

  /* ---------- DEMO (localStorage) ---------- */
  var LS_KEY = "contractors_db_v1";
  var SS_USER = "demo_admin_user";
  var DEMO_PASSWORD = "demo"; // dùng để test admin ở chế độ demo

  function lsAll() { try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch (e) { return null; } }
  function lsSet(arr) { localStorage.setItem(LS_KEY, JSON.stringify(arr)); }

  async function seedIfEmpty() {
    if (lsAll()) return;
    try {
      var r = await fetch("data/contractors.json", { cache: "no-store" });
      var j = await r.json();
      lsSet(j.contractors || []);
    } catch (e) { lsSet([]); }
  }

  /* ---------- LIST / GET / SAVE / REMOVE ---------- */
  DB.list = async function (opts) {
    await DB.ready;
    var arr;
    if (useFirebase) {
      var m = fb.fsMod;
      var snap = await m.getDocs(m.collection(fb.fs, "contractors"));
      arr = snap.docs.map(function (d) { var o = d.data(); o.id = d.id; return o; });
    } else {
      await seedIfEmpty();
      arr = lsAll() || [];
    }
    if (opts && opts.publishedOnly) arr = arr.filter(function (c) { return c.published !== false; });
    arr.sort(function (a, b) { return (a.name || "").localeCompare(b.name || "", "vi"); });
    return arr;
  };

  DB.get = async function (id) {
    await DB.ready;
    if (useFirebase) {
      var m = fb.fsMod;
      var snap = await m.getDoc(m.doc(fb.fs, "contractors", id));
      if (!snap.exists()) return null;
      var o = snap.data(); o.id = id; return o;
    }
    await seedIfEmpty();
    var found = (lsAll() || []).filter(function (c) { return c.id === id; })[0];
    return found || null;
  };

  DB.save = async function (rec) {
    await DB.ready;
    if (!rec.id) throw new Error("Thiếu id (slug) cho nhà thầu");
    if (useFirebase) {
      var m = fb.fsMod;
      var data = Object.assign({}, rec); delete data.id;
      await m.setDoc(m.doc(fb.fs, "contractors", rec.id), data);
      return rec;
    }
    await seedIfEmpty();
    var arr = lsAll() || [];
    var i = arr.findIndex(function (c) { return c.id === rec.id; });
    if (i >= 0) arr[i] = rec; else arr.push(rec);
    lsSet(arr);
    return rec;
  };

  DB.remove = async function (id) {
    await DB.ready;
    if (useFirebase) {
      var m = fb.fsMod;
      await m.deleteDoc(m.doc(fb.fs, "contractors", id));
      return;
    }
    var arr = (lsAll() || []).filter(function (c) { return c.id !== id; });
    lsSet(arr);
  };

  /* Ghi đè toàn bộ (dùng cho Import JSON ở admin) */
  DB.replaceAll = async function (list) {
    await DB.ready;
    if (useFirebase) {
      for (var i = 0; i < list.length; i++) await DB.save(list[i]);
      return;
    }
    lsSet(list);
  };

  /* ---------- AUTH ---------- */
  var demoListeners = [];
  function demoUser() { try { return JSON.parse(sessionStorage.getItem(SS_USER)); } catch (e) { return null; } }
  function emitDemo() { var u = demoUser(); demoListeners.forEach(function (cb) { cb(u); }); }

  DB.onAuth = function (cb) {
    if (useFirebase) {
      DB.ready.then(function () { fb.authMod.onAuthStateChanged(fb.auth, cb); });
    } else {
      demoListeners.push(cb);
      cb(demoUser());
    }
  };

  DB.login = async function (email, pw) {
    await DB.ready;
    if (useFirebase) {
      var res = await fb.authMod.signInWithEmailAndPassword(fb.auth, email, pw);
      return res.user;
    }
    if (pw !== DEMO_PASSWORD) { var err = new Error("Sai mật khẩu demo (gợi ý: demo)"); err.code = "demo/wrong"; throw err; }
    var u = { email: email || "admin@demo", demo: true };
    sessionStorage.setItem(SS_USER, JSON.stringify(u));
    emitDemo();
    return u;
  };

  DB.logout = async function () {
    await DB.ready;
    if (useFirebase) { await fb.authMod.signOut(fb.auth); return; }
    sessionStorage.removeItem(SS_USER);
    emitDemo();
  };

  DB.currentUser = function () {
    if (useFirebase) { return fb && fb.auth ? fb.auth.currentUser : null; }
    return demoUser();
  };

  window.DB = DB;
})();
