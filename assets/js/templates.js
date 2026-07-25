/*
 * templates.js — 10 thiết kế trang hồ sơ nhà thầu, cùng đọc 1 schema dữ liệu.
 * window.TEMPLATES[id] = { name, desc, fonts:[...], css, render(c) }
 * window.TEMPLATE_LIST = [{id,name,desc}]
 * Dùng ở profile.html (render thật) và admin.html (preview).
 */
(function () {
  function esc(s) {
    return (s == null ? "" : String(s)).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function has(x) { return arr(x).length > 0; }
  function tel(s) { return (s || "").replace(/[^0-9+]/g, ""); }
  function pad(i) { return (i + 1 < 10 ? "0" : "") + (i + 1); }

  /* ---------- Bộ dựng section dùng chung (class chung, template tự tô CSS) ---------- */
  function secHead(eyebrow, title) {
    return (
      '<div class="sec-head">' +
      (eyebrow ? '<div class="eyebrow">' + esc(eyebrow) + "</div>" : "") +
      (title ? '<h2 class="sec-title">' + esc(title) + "</h2>" : "") +
      "</div>"
    );
  }
  function statsRow(c) {
    if (!has(c.stats)) return "";
    return '<div class="stats">' + arr(c.stats).map(function (s) {
      return '<div class="stat"><div class="stat-n">' + esc(s.value) + '</div><div class="stat-l">' + esc(s.label) + "</div></div>";
    }).join("") + "</div>";
  }
  function servicesBlk(c, eyebrow, title) {
    if (!has(c.services)) return "";
    return '<section class="sec sec-services" id="dich-vu">' + secHead(eyebrow, title) +
      '<div class="svc-grid">' + arr(c.services).map(function (s, i) {
        return '<div class="svc"><div class="svc-num">' + pad(i) + '</div><h3 class="svc-title">' +
          esc(s.title) + '</h3><p class="svc-desc">' + esc(s.desc) + "</p></div>";
      }).join("") + "</div></section>";
  }
  function whyBlk(c, eyebrow, title) {
    if (!has(c.why)) return "";
    return '<section class="sec sec-why" id="ly-do">' + secHead(eyebrow, title) +
      '<div class="why-grid">' + arr(c.why).map(function (w, i) {
        return '<div class="why"><div class="why-num">' + pad(i) + '</div><div class="why-txt"><h3 class="why-title">' +
          esc(w.title) + '</h3><p class="why-desc">' + esc(w.desc) + "</p></div></div>";
      }).join("") + "</div></section>";
  }
  function processBlk(c, eyebrow, title) {
    if (!has(c.process)) return "";
    return '<section class="sec sec-process" id="quy-trinh">' + secHead(eyebrow, title) +
      '<div class="proc-grid">' + arr(c.process).map(function (p, i) {
        return '<div class="proc"><div class="proc-num">' + pad(i) + '</div><h3 class="proc-title">' +
          esc(p.title) + '</h3><p class="proc-desc">' + esc(p.desc) + "</p></div>";
      }).join("") + "</div></section>";
  }
  function projectsBlk(c, eyebrow, title) {
    if (!has(c.projects)) return "";
    return '<section class="sec sec-projects" id="du-an">' + secHead(eyebrow, title) +
      '<div class="proj-grid">' + arr(c.projects).map(function (p) {
        return '<div class="proj"><div class="proj-imgwrap">' +
          (p.image ? '<img class="proj-img" src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy">' : "") +
          (p.badge ? '<span class="proj-badge">' + esc(p.badge) + "</span>" : "") +
          '</div><div class="proj-body"><h3 class="proj-title">' + esc(p.title) +
          '</h3><p class="proj-meta">' + esc(p.meta) + "</p></div></div>";
      }).join("") + "</div></section>";
  }
  function stylesBlk(c, eyebrow, title) {
    if (!has(c.styles)) return "";
    return '<section class="sec sec-styles" id="phong-cach">' + secHead(eyebrow, title) +
      '<div class="style-grid">' + arr(c.styles).map(function (s, i) {
        return '<div class="style"><div class="style-num">' + pad(i) + '</div><h3 class="style-name">' +
          esc(s.name) + '</h3><p class="style-desc">' + esc(s.desc) + "</p></div>";
      }).join("") + "</div></section>";
  }
  function aboutBlk(c, eyebrow, title) {
    if (!has(c.about) && !c.hero) return "";
    var paras = arr(c.about).map(function (p) { return '<p class="about-p">' + esc(p) + "</p>"; }).join("");
    return '<section class="sec sec-about" id="gioi-thieu">' +
      '<div class="about-grid">' +
      '<div class="about-media">' + (c.hero ? '<img src="' + esc(c.hero) + '" alt="' + esc(c.name) + '">' : "") + "</div>" +
      '<div class="about-txt">' + secHead(eyebrow, title) + paras + "</div>" +
      "</div></section>";
  }
  function contactBlk(c) {
    var k = c.contact || {};
    var items = [];
    if (k.phone || k.phone2) {
      var phones = [k.phone, k.phone2].filter(Boolean).map(function (p) {
        return '<a href="tel:' + tel(p) + '">' + esc(p) + "</a>";
      }).join(" · ");
      items.push('<div class="c-item"><div class="c-label">HOTLINE</div><div class="c-val c-phone">' + phones + "</div></div>");
    }
    if (k.email) items.push('<div class="c-item"><div class="c-label">EMAIL</div><div class="c-val"><a href="mailto:' + esc(k.email) + '">' + esc(k.email) + "</a></div></div>");
    arr(k.offices).forEach(function (o) {
      items.push('<div class="c-item"><div class="c-label">' + esc(o.label || "ĐỊA CHỈ") + '</div><div class="c-val">' + esc(o.address) + "</div></div>");
    });
    var social = [];
    if (k.facebook) social.push('<a href="' + esc(k.facebook) + '" target="_blank" rel="noopener">Facebook</a>');
    if (k.website) social.push('<a href="' + esc(k.website) + '" target="_blank" rel="noopener">Website</a>');
    return '<section class="sec sec-contact" id="lien-he">' +
      '<div class="contact-wrap">' +
      '<div class="contact-left">' + secHead("LIÊN HỆ", "Bắt đầu công trình của bạn") +
      '<p class="contact-lead">Gọi hotline hoặc để lại thông tin, đội ngũ ' + esc(c.name) + ' sẽ tư vấn và báo giá miễn phí.</p>' +
      '<div class="c-items">' + items.join("") + "</div>" +
      (social.length ? '<div class="c-social">' + social.join("") + "</div>" : "") +
      "</div>" +
      '<form class="contact-form" onsubmit="event.preventDefault();this.querySelector(\'.ok\').style.display=\'block\';this.reset();">' +
      "<h3>Nhận tư vấn &amp; báo giá</h3>" +
      '<input required placeholder="Họ và tên">' +
      '<input required placeholder="Số điện thoại">' +
      '<input placeholder="Loại công trình">' +
      '<textarea rows="3" placeholder="Nội dung cần tư vấn"></textarea>' +
      '<button type="submit">Gửi yêu cầu</button>' +
      '<div class="ok" style="display:none">Đã gửi! ' + esc(c.name) + " sẽ liên hệ với bạn sớm.</div>" +
      "</form></div></section>";
  }
  function header(c, navBtn) {
    var brand = c.logo
      ? '<img class="logo" src="' + esc(c.logo) + '" alt="' + esc(c.name) + '">'
      : '<span class="logo-txt">' + esc(c.name) + "</span>";
    return '<header class="site-head"><a class="brand" href="index.html">' + brand + "</a>" +
      '<div class="head-right"><a class="back" href="index.html">← Nhà thầu khác</a>' +
      '<a class="head-cta" href="#lien-he">' + (navBtn || "Liên hệ") + "</a></div></header>";
  }
  function footer(c) {
    return '<footer class="site-foot"><div>© 2026 ' + esc(c.name) + "</div>" +
      '<div class="foot-links"><a href="index.html">Trang chọn nhà thầu</a></div></footer>';
  }
  function heroStats(c) { return statsRow(c); }

  // Fallback ảnh hero dạng nền
  function bg(url) { return url ? "background-image:url('" + esc(url).replace(/'/g, "%27") + "')" : ""; }

  var T = {};

  /* =========================================================
     T1 — TERRACOTTA CLASSIC  (kem · navy · cam đất)
  ========================================================= */
  T.t1 = {
    name: "Terracotta Classic", desc: "Kem · Navy · Cam đất — ấm áp, tin cậy",
    fonts: ["Montserrat:wght@400;500;600;700;800;900"],
    css: "\
.tpl.t1{--ink:#18160F;--cream:#FAF8F3;--card:#FEFDFB;--navy:#0F1E2E;--muted:#68644F;--line:#E7E2D5;--acc:#B85C2E;--acc2:#CF7C4B;font-family:'Montserrat',sans-serif;color:var(--ink);background:#fff}\
.tpl.t1 .site-head{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;padding:14px clamp(20px,4vw,48px);background:#ffffffee;backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}\
.tpl.t1 .logo{height:40px}.tpl.t1[data-loginv='1'] .logo{filter:brightness(0)}.tpl.t1 .logo-txt{font-weight:800;font-size:22px}\
.tpl.t1 .head-right{display:flex;gap:16px;align-items:center;font-size:13px}.tpl.t1 .back{color:var(--muted)}\
.tpl.t1 .head-cta{background:var(--ink);color:#fff;padding:10px 18px;border-radius:100px;font-weight:700}\
.tpl.t1 .hero{position:relative;min-height:clamp(520px,82vh,780px);display:flex;align-items:flex-end;color:#fff;background-size:cover;background-position:center}\
.tpl.t1 .hero::after{content:'';position:absolute;inset:0;background:linear-gradient(0deg,rgba(8,7,4,.92),rgba(8,7,4,.35) 60%,rgba(8,7,4,.1))}\
.tpl.t1 .hero-inner{position:relative;z-index:1;padding:clamp(40px,7vw,72px) clamp(20px,4vw,48px);max-width:1200px;margin:0 auto;width:100%}\
.tpl.t1 .hero-badge{display:inline-block;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.28);padding:7px 15px;border-radius:100px;font-size:12.5px;font-weight:600;letter-spacing:.04em;margin-bottom:20px}\
.tpl.t1 .hero h1{font-size:clamp(34px,5.4vw,60px);font-weight:800;line-height:1.08;letter-spacing:-.02em;margin:0 0 16px;max-width:760px}\
.tpl.t1 .hero-tag{font-size:clamp(16px,1.6vw,19px);color:rgba(255,255,255,.9);max-width:560px;margin:0 0 32px}\
.tpl.t1 .hero .stats{display:flex;flex-wrap:wrap;gap:clamp(22px,4vw,52px);border-top:1px solid rgba(255,255,255,.2);padding-top:24px}\
.tpl.t1 .stat-n{font-size:clamp(22px,3vw,32px);font-weight:800;line-height:1}.tpl.t1 .stat-l{font-size:12.5px;color:rgba(255,255,255,.82);margin-top:6px}\
.tpl.t1 .sec{max-width:1200px;margin:0 auto;padding:clamp(52px,8vw,96px) clamp(20px,4vw,48px)}\
.tpl.t1 .eyebrow{font-size:12.5px;font-weight:700;letter-spacing:.08em;color:var(--acc);margin-bottom:10px}\
.tpl.t1 .sec-title{font-size:clamp(25px,3.2vw,36px);font-weight:800;letter-spacing:-.02em;margin:0 0 34px}\
.tpl.t1 .sec-about{max-width:none;background:var(--navy);color:#fff}\
.tpl.t1 .about-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:minmax(240px,400px) 1fr;gap:52px;align-items:center}\
.tpl.t1 .about-media img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:4px}\
.tpl.t1 .sec-about .eyebrow{color:var(--acc2)}.tpl.t1 .about-p{color:rgba(255,255,255,.75);line-height:1.8;margin:0 0 16px}\
.tpl.t1 .svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:18px;overflow:hidden}\
.tpl.t1 .svc{background:var(--card);padding:30px 24px;min-height:190px}.tpl.t1 .svc-num{font-family:'Montserrat',sans-serif;color:#B3AC96;font-weight:700;margin-bottom:14px}\
.tpl.t1 .svc-title{font-size:17.5px;margin:0 0 12px}.tpl.t1 .svc-desc{font-size:14px;line-height:1.6;color:var(--muted);margin:0}\
.tpl.t1 .sec-why{background:var(--cream);max-width:none}.tpl.t1 .sec-why>*{max-width:1200px;margin-left:auto;margin-right:auto}\
.tpl.t1 .why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:30px 40px}\
.tpl.t1 .why{display:flex;gap:16px}.tpl.t1 .why-num{font-family:'Montserrat',sans-serif;font-size:44px;font-weight:800;color:var(--acc);line-height:1}\
.tpl.t1 .why-title{font-size:16px;margin:0 0 6px}.tpl.t1 .why-desc{font-size:14px;line-height:1.6;color:var(--muted);margin:0}\
.tpl.t1 .sec-process{background:var(--navy);color:#fff;max-width:none}.tpl.t1 .sec-process>*{max-width:1200px;margin-left:auto;margin-right:auto}\
.tpl.t1 .sec-process .sec-head{text-align:center}.tpl.t1 .sec-process .eyebrow{color:var(--acc2)}\
.tpl.t1 .proc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:28px}\
.tpl.t1 .proc{border-left:2px solid rgba(255,255,255,.16);padding-left:20px}.tpl.t1 .proc-num{font-family:'Montserrat',sans-serif;font-size:44px;font-weight:900;color:var(--acc2);opacity:.6;margin-bottom:12px}\
.tpl.t1 .proc-title{font-size:16px;margin:0 0 6px}.tpl.t1 .proc-desc{font-size:13.5px;line-height:1.6;color:rgba(255,255,255,.65);margin:0}\
.tpl.t1 .proj-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:22px}\
.tpl.t1 .proj{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff}\
.tpl.t1 .proj-imgwrap{position:relative;aspect-ratio:4/3}.tpl.t1 .proj-img{width:100%;height:100%;object-fit:cover}\
.tpl.t1 .proj-badge{position:absolute;top:12px;left:12px;background:rgba(24,22,15,.78);color:#fff;font-size:11px;font-weight:700;padding:5px 11px;border-radius:100px}\
.tpl.t1 .proj-body{padding:18px 20px}.tpl.t1 .proj-title{font-size:15.5px;margin:0 0 5px}.tpl.t1 .proj-meta{font-size:13px;color:var(--muted);margin:0}\
.tpl.t1 .sec-styles{background:var(--cream);max-width:none}.tpl.t1 .sec-styles>*{max-width:1200px;margin-left:auto;margin-right:auto}\
.tpl.t1 .style-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:22px}\
.tpl.t1 .style{background:#fff;border:1px solid var(--line);border-radius:14px;padding:28px}.tpl.t1 .style-num{color:var(--acc);font-weight:700;font-family:'Montserrat',sans-serif;margin-bottom:10px}\
.tpl.t1 .style-name{font-size:18px;margin:0 0 8px}.tpl.t1 .style-desc{font-size:14px;line-height:1.7;color:var(--muted);margin:0}\
.tpl.t1 .sec-contact{background:var(--ink);color:#fff;max-width:none}.tpl.t1 .contact-wrap{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px}\
.tpl.t1 .sec-contact .eyebrow{color:var(--acc2)}.tpl.t1 .contact-lead{color:rgba(255,255,255,.7);line-height:1.7;margin:0 0 26px}\
.tpl.t1 .c-item{margin-bottom:16px}.tpl.t1 .c-label{font-size:11.5px;letter-spacing:.06em;color:rgba(255,255,255,.5);margin-bottom:3px}.tpl.t1 .c-val{color:rgba(255,255,255,.9)}.tpl.t1 .c-phone a{font-weight:700;font-size:17px}\
.tpl.t1 .c-social{display:flex;gap:16px;margin-top:20px;font-size:13.5px;color:var(--acc2)}\
.tpl.t1 .contact-form{background:#fff;color:var(--ink);border-radius:16px;padding:30px;display:flex;flex-direction:column;gap:12px}\
.tpl.t1 .contact-form h3{margin:0 0 6px;font-size:19px}\
.tpl.t1 .contact-form input,.tpl.t1 .contact-form textarea{padding:12px 15px;border:1px solid var(--line);border-radius:9px;font-family:inherit;font-size:14px}\
.tpl.t1 .contact-form button{background:var(--acc);color:#fff;border:0;padding:14px;border-radius:100px;font-weight:700;font-family:inherit;font-size:14px;cursor:pointer}\
.tpl.t1 .ok{color:#2E7D32;font-size:13px;font-weight:600}\
.tpl.t1 .site-foot{background:var(--navy);color:rgba(255,255,255,.55);padding:32px clamp(20px,4vw,48px);display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;font-size:13px}\
@media(max-width:820px){.tpl.t1 .about-grid,.tpl.t1 .contact-wrap{grid-template-columns:1fr}.tpl.t1 .about-media{display:none}}",
    render: function (c) {
      return header(c) +
        '<section class="hero" style="' + bg(c.hero) + '"><div class="hero-inner">' +
        (c.badge ? '<span class="hero-badge">' + esc(c.badge) + "</span>" : "") +
        "<h1>" + esc(c.name) + " — " + esc(c.tagline) + "</h1>" +
        (has(c.about) ? '<p class="hero-tag">' + esc(c.about[0]) + "</p>" : "") +
        heroStats(c) + "</div></section>" +
        aboutBlk(c, "GIỚI THIỆU", "Về " + c.name) +
        servicesBlk(c, "DỊCH VỤ", "Giải pháp trọn gói") +
        whyBlk(c, "CAM KẾT", "Vì sao chọn " + c.name) +
        processBlk(c, "QUY TRÌNH", "Quy trình làm việc") +
        projectsBlk(c, "CÔNG TRÌNH", "Dự án tiêu biểu") +
        stylesBlk(c, "PHONG CÁCH", "Phong cách thiết kế") +
        contactBlk(c) + footer(c);
    }
  };

  /* =========================================================
     T2 — NOIR LUXE  (đen · vàng gold · serif)
  ========================================================= */
  T.t2 = {
    name: "Noir Luxe", desc: "Đen · Gold · Serif — sang trọng, cao cấp",
    fonts: ["Montserrat:wght@400;500;600;700;800;900"],
    css: "\
.tpl.t2{--bg:#0B0B0D;--pane:#141418;--gold:#C9A24B;--gold2:#E4C578;--tx:#EAE7E1;--mut:#9A968C;--line:#26262C;font-family:'Montserrat',sans-serif;color:var(--tx);background:var(--bg)}\
.tpl.t2 .site-head{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;padding:16px clamp(20px,4vw,48px);background:#0b0b0dd9;backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}\
.tpl.t2 .logo{height:38px}.tpl.t2[data-loginv='1'] .logo{filter:brightness(0) invert(1)}.tpl.t2 .logo-txt{font-family:'Montserrat',sans-serif;font-size:26px;font-weight:700;letter-spacing:.04em;color:var(--gold2)}\
.tpl.t2 .head-right{display:flex;gap:18px;align-items:center;font-size:13px}.tpl.t2 .back{color:var(--mut)}\
.tpl.t2 .head-cta{border:1px solid var(--gold);color:var(--gold2);padding:9px 20px;border-radius:2px;letter-spacing:.06em;text-transform:uppercase;font-size:11.5px}\
.tpl.t2 .hero{position:relative;min-height:clamp(560px,88vh,820px);display:flex;align-items:center;justify-content:center;text-align:center;background-size:cover;background-position:center}\
.tpl.t2 .hero::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(11,11,13,.55),rgba(11,11,13,.9))}\
.tpl.t2 .hero-inner{position:relative;z-index:1;padding:60px 24px;max-width:900px}\
.tpl.t2 .hero-badge{color:var(--gold2);letter-spacing:.28em;text-transform:uppercase;font-size:12px;margin-bottom:24px;display:block}\
.tpl.t2 .hero h1{font-family:'Montserrat',sans-serif;font-weight:600;font-size:clamp(40px,7vw,84px);line-height:1.02;margin:0 0 20px}\
.tpl.t2 .hero-tag{color:var(--mut);max-width:560px;margin:0 auto 40px;line-height:1.7}\
.tpl.t2 .hero .stats{display:flex;justify-content:center;flex-wrap:wrap;gap:clamp(28px,5vw,64px);border-top:1px solid var(--line);padding-top:28px;max-width:720px;margin:0 auto}\
.tpl.t2 .stat-n{font-family:'Montserrat',sans-serif;font-size:clamp(30px,4vw,46px);color:var(--gold2);line-height:1}.tpl.t2 .stat-l{font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--mut);margin-top:8px}\
.tpl.t2 .sec{max-width:1140px;margin:0 auto;padding:clamp(56px,9vw,110px) clamp(20px,4vw,48px)}\
.tpl.t2 .eyebrow{color:var(--gold);letter-spacing:.24em;text-transform:uppercase;font-size:11.5px;margin-bottom:14px}\
.tpl.t2 .sec-title{font-family:'Montserrat',sans-serif;font-weight:600;font-size:clamp(30px,4.4vw,52px);margin:0 0 40px}\
.tpl.t2 .sec-about{max-width:none;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}\
.tpl.t2 .about-grid{max-width:1140px;margin:0 auto;display:grid;grid-template-columns:1fr minmax(240px,380px);gap:60px;align-items:center}\
.tpl.t2 .about-media img{width:100%;aspect-ratio:3/4;object-fit:cover;filter:grayscale(.15) contrast(1.05)}\
.tpl.t2 .about-p{color:var(--mut);line-height:1.9;margin:0 0 18px}\
.tpl.t2 .svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}\
.tpl.t2 .svc{border:1px solid var(--line);padding:34px 28px;background:var(--pane);transition:.2s}.tpl.t2 .svc:hover{border-color:var(--gold)}\
.tpl.t2 .svc-num{font-family:'Montserrat',sans-serif;color:var(--gold);font-size:28px;margin-bottom:16px}\
.tpl.t2 .svc-title{font-family:'Montserrat',sans-serif;font-size:23px;font-weight:600;margin:0 0 10px}.tpl.t2 .svc-desc{font-size:13.5px;line-height:1.7;color:var(--mut);margin:0}\
.tpl.t2 .why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:1px;background:var(--line);border:1px solid var(--line)}\
.tpl.t2 .why{background:var(--bg);padding:30px 26px;display:flex;gap:16px}.tpl.t2 .why-num{color:var(--gold);font-family:'Montserrat',sans-serif;font-size:26px}\
.tpl.t2 .why-title{font-size:15px;margin:0 0 6px;letter-spacing:.02em}.tpl.t2 .why-desc{font-size:13px;line-height:1.65;color:var(--mut);margin:0}\
.tpl.t2 .proc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:34px}\
.tpl.t2 .proc-num{font-family:'Montserrat',sans-serif;color:var(--gold);font-size:40px;border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:14px}\
.tpl.t2 .proc-title{font-size:15px;margin:0 0 6px}.tpl.t2 .proc-desc{font-size:13px;line-height:1.65;color:var(--mut);margin:0}\
.tpl.t2 .sec-projects{max-width:none;background:var(--pane)}.tpl.t2 .sec-projects>*{max-width:1140px;margin-left:auto;margin-right:auto}\
.tpl.t2 .proj-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2px;background:var(--line);border:1px solid var(--line)}\
.tpl.t2 .proj{position:relative;background:var(--bg)}.tpl.t2 .proj-imgwrap{position:relative;aspect-ratio:4/3;overflow:hidden}.tpl.t2 .proj-img{width:100%;height:100%;object-fit:cover;transition:.5s}.tpl.t2 .proj:hover .proj-img{transform:scale(1.05)}\
.tpl.t2 .proj-badge{position:absolute;top:14px;left:14px;color:var(--gold2);border:1px solid var(--gold);padding:4px 12px;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;background:rgba(11,11,13,.6)}\
.tpl.t2 .proj-body{padding:20px 22px}.tpl.t2 .proj-title{font-family:'Montserrat',sans-serif;font-size:22px;font-weight:600;margin:0 0 5px}.tpl.t2 .proj-meta{font-size:12.5px;color:var(--mut);margin:0}\
.tpl.t2 .style-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}\
.tpl.t2 .style{border-top:2px solid var(--gold);padding:22px 4px 0}.tpl.t2 .style-num{color:var(--gold);letter-spacing:.2em;font-size:11px;margin-bottom:10px}\
.tpl.t2 .style-name{font-family:'Montserrat',sans-serif;font-size:24px;font-weight:600;margin:0 0 8px}.tpl.t2 .style-desc{font-size:13px;line-height:1.7;color:var(--mut);margin:0}\
.tpl.t2 .sec-contact{max-width:none;border-top:1px solid var(--line)}.tpl.t2 .contact-wrap{max-width:1140px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:56px}\
.tpl.t2 .contact-lead{color:var(--mut);line-height:1.8;margin:0 0 28px}\
.tpl.t2 .c-label{color:var(--gold);letter-spacing:.14em;font-size:11px;margin-bottom:4px}.tpl.t2 .c-item{margin-bottom:18px}.tpl.t2 .c-phone a{font-family:'Montserrat',sans-serif;font-size:22px;color:var(--gold2)}\
.tpl.t2 .c-social{display:flex;gap:18px;margin-top:22px;color:var(--gold);font-size:13px}\
.tpl.t2 .contact-form{border:1px solid var(--line);background:var(--pane);padding:34px;display:flex;flex-direction:column;gap:14px}\
.tpl.t2 .contact-form h3{font-family:'Montserrat',sans-serif;font-size:26px;font-weight:600;margin:0 0 6px}\
.tpl.t2 .contact-form input,.tpl.t2 .contact-form textarea{background:var(--bg);border:1px solid var(--line);color:var(--tx);padding:13px 15px;font-family:inherit;font-size:14px}\
.tpl.t2 .contact-form button{background:var(--gold);color:#1a1508;border:0;padding:15px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:12px;cursor:pointer;font-family:inherit}\
.tpl.t2 .ok{color:var(--gold2);font-size:13px}\
.tpl.t2 .site-foot{border-top:1px solid var(--line);padding:32px clamp(20px,4vw,48px);display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;font-size:12.5px;color:var(--mut)}.tpl.t2 .foot-links a{color:var(--gold)}\
@media(max-width:820px){.tpl.t2 .about-grid,.tpl.t2 .contact-wrap{grid-template-columns:1fr}.tpl.t2 .about-media{display:none}}",
    render: function (c) {
      return header(c, "Đặt lịch") +
        '<section class="hero" style="' + bg(c.hero) + '"><div class="hero-inner">' +
        (c.badge ? '<span class="hero-badge">' + esc(c.badge) + "</span>" : "") +
        "<h1>" + esc(c.name) + "</h1>" +
        '<p class="hero-tag">' + esc(c.tagline) + (has(c.about) ? " — " + esc(c.about[0]) : "") + "</p>" +
        heroStats(c) + "</div></section>" +
        aboutBlk(c, "TRIẾT LÝ", "Đẳng cấp trong từng chi tiết") +
        servicesBlk(c, "DỊCH VỤ", "Dịch vụ tuyển chọn") +
        whyBlk(c, "GIÁ TRỊ", "Vì sao chọn chúng tôi") +
        processBlk(c, "QUY TRÌNH", "Hành trình kiến tạo") +
        projectsBlk(c, "TÁC PHẨM", "Bộ sưu tập công trình") +
        stylesBlk(c, "PHONG CÁCH", "Ngôn ngữ thiết kế") +
        contactBlk(c) + footer(c);
    }
  };

  /* =========================================================
     T3 — PURE MINIMAL  (trắng · đen · thanh mảnh)
  ========================================================= */
  T.t3 = {
    name: "Pure Minimal", desc: "Trắng · Tối giản · Nhiều khoảng thở",
    fonts: ["Montserrat:wght@400;500;600;700;800;900"],
    css: "\
.tpl.t3{--tx:#111;--mut:#888;--line:#EAEAEA;--acc:#111;font-family:'Montserrat',sans-serif;color:var(--tx);background:#fff;font-weight:400}\
.tpl.t3 .site-head{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;padding:22px clamp(20px,5vw,64px);background:#ffffffe6;backdrop-filter:blur(6px)}\
.tpl.t3 .logo{height:34px}.tpl.t3[data-loginv='1'] .logo{filter:brightness(0)}.tpl.t3 .logo-txt{font-weight:600;font-size:18px;letter-spacing:-.01em}\
.tpl.t3 .head-right{display:flex;gap:22px;align-items:center;font-family:'Montserrat',sans-serif;font-size:12px}.tpl.t3 .back{color:var(--mut)}\
.tpl.t3 .head-cta{color:var(--tx);border-bottom:1px solid var(--tx);padding-bottom:2px}\
.tpl.t3 .hero{padding:clamp(70px,13vw,150px) clamp(20px,5vw,64px) clamp(40px,6vw,70px);max-width:1100px;margin:0 auto}\
.tpl.t3 .hero-badge{font-family:'Montserrat',sans-serif;font-size:12px;color:var(--mut);letter-spacing:.02em;display:block;margin-bottom:28px}\
.tpl.t3 .hero h1{font-size:clamp(38px,7vw,82px);font-weight:300;line-height:1.05;letter-spacing:-.03em;margin:0 0 22px;max-width:900px}\
.tpl.t3 .hero-tag{font-size:clamp(16px,1.8vw,20px);color:var(--mut);font-weight:300;max-width:540px;margin:0}\
.tpl.t3 .hero-figure{max-width:1100px;margin:0 auto;padding:0 clamp(20px,5vw,64px)}.tpl.t3 .hero-figure img{width:100%;aspect-ratio:16/8;object-fit:cover}\
.tpl.t3 .hero .stats{display:flex;flex-wrap:wrap;gap:clamp(30px,6vw,80px);max-width:1100px;margin:44px auto 0;padding:36px clamp(20px,5vw,64px) 0;border-top:1px solid var(--line)}\
.tpl.t3 .stat-n{font-size:clamp(26px,3vw,38px);font-weight:300;letter-spacing:-.02em}.tpl.t3 .stat-l{font-family:'Montserrat',sans-serif;font-size:11.5px;color:var(--mut);margin-top:8px}\
.tpl.t3 .sec{max-width:1100px;margin:0 auto;padding:clamp(60px,10vw,120px) clamp(20px,5vw,64px)}\
.tpl.t3 .eyebrow{font-family:'Montserrat',sans-serif;font-size:12px;color:var(--mut);margin-bottom:20px}\
.tpl.t3 .sec-title{font-size:clamp(26px,3.6vw,44px);font-weight:300;letter-spacing:-.02em;margin:0 0 48px}\
.tpl.t3 .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start}\
.tpl.t3 .about-media img{width:100%;aspect-ratio:1;object-fit:cover}.tpl.t3 .about-p{font-size:16px;font-weight:300;line-height:1.9;color:#444;margin:0 0 20px}\
.tpl.t3 .svc-grid,.tpl.t3 .why-grid,.tpl.t3 .proc-grid{display:grid;grid-template-columns:1fr;gap:0}\
.tpl.t3 .svc,.tpl.t3 .why,.tpl.t3 .proc{display:grid;grid-template-columns:80px 1fr;gap:24px;padding:30px 0;border-top:1px solid var(--line);align-items:start}\
.tpl.t3 .svc:last-child,.tpl.t3 .why:last-child,.tpl.t3 .proc:last-child{border-bottom:1px solid var(--line)}\
.tpl.t3 .svc-num,.tpl.t3 .why-num,.tpl.t3 .proc-num{font-family:'Montserrat',sans-serif;color:var(--mut);font-size:13px}\
.tpl.t3 .svc-title,.tpl.t3 .why-title,.tpl.t3 .proc-title{font-size:20px;font-weight:400;margin:0 0 8px;letter-spacing:-.01em}\
.tpl.t3 .svc-desc,.tpl.t3 .why-desc,.tpl.t3 .proc-desc{font-size:14.5px;font-weight:300;line-height:1.7;color:var(--mut);margin:0;max-width:560px}\
.tpl.t3 .why-txt{grid-column:2}.tpl.t3 .why{grid-template-columns:80px 1fr}\
.tpl.t3 .proj-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:8px 8px}\
.tpl.t3 .proj-imgwrap{position:relative;aspect-ratio:4/3;overflow:hidden;background:#f4f4f4}.tpl.t3 .proj-img{width:100%;height:100%;object-fit:cover;transition:.6s}.tpl.t3 .proj:hover .proj-img{transform:scale(1.04)}\
.tpl.t3 .proj-badge{position:absolute;bottom:12px;left:12px;background:#fff;font-family:'Montserrat',sans-serif;font-size:10.5px;padding:4px 10px}\
.tpl.t3 .proj-body{padding:14px 2px}.tpl.t3 .proj-title{font-size:16px;font-weight:400;margin:0 0 4px}.tpl.t3 .proj-meta{font-family:'Montserrat',sans-serif;font-size:11.5px;color:var(--mut);margin:0}\
.tpl.t3 .style-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:40px}\
.tpl.t3 .style-num{font-family:'Montserrat',sans-serif;color:var(--mut);font-size:12px;margin-bottom:12px}.tpl.t3 .style-name{font-size:20px;font-weight:400;margin:0 0 10px}.tpl.t3 .style-desc{font-size:14px;font-weight:300;line-height:1.75;color:var(--mut);margin:0}\
.tpl.t3 .sec-contact{border-top:1px solid var(--line)}.tpl.t3 .contact-wrap{display:grid;grid-template-columns:1fr 1fr;gap:60px}\
.tpl.t3 .contact-lead{font-weight:300;font-size:16px;line-height:1.8;color:#444;margin:0 0 30px}\
.tpl.t3 .c-label{font-family:'Montserrat',sans-serif;font-size:11px;color:var(--mut);margin-bottom:4px}.tpl.t3 .c-item{margin-bottom:20px}.tpl.t3 .c-phone a{font-size:20px;font-weight:300}\
.tpl.t3 .c-social{display:flex;gap:20px;margin-top:24px;font-family:'Montserrat',sans-serif;font-size:12px}\
.tpl.t3 .contact-form{display:flex;flex-direction:column;gap:0}.tpl.t3 .contact-form h3{font-weight:400;font-size:18px;margin:0 0 20px}\
.tpl.t3 .contact-form input,.tpl.t3 .contact-form textarea{border:0;border-bottom:1px solid var(--line);padding:16px 0;font-family:inherit;font-size:15px;font-weight:300}\
.tpl.t3 .contact-form button{margin-top:24px;background:var(--tx);color:#fff;border:0;padding:16px;font-family:inherit;font-size:14px;cursor:pointer;align-self:flex-start;padding-left:40px;padding-right:40px}\
.tpl.t3 .ok{color:#2E7D32;font-size:13px;margin-top:14px}\
.tpl.t3 .site-foot{border-top:1px solid var(--line);padding:36px clamp(20px,5vw,64px);display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;font-family:'Montserrat',sans-serif;font-size:12px;color:var(--mut)}\
@media(max-width:760px){.tpl.t3 .about-grid,.tpl.t3 .contact-wrap{grid-template-columns:1fr;gap:36px}.tpl.t3 .svc,.tpl.t3 .why,.tpl.t3 .proc{grid-template-columns:50px 1fr;gap:14px}}",
    render: function (c) {
      return header(c, "Liên hệ") +
        '<section class="hero">' +
        (c.badge ? '<span class="hero-badge">' + esc(c.badge) + "</span>" : "") +
        "<h1>" + esc(c.name) + "</h1>" +
        '<p class="hero-tag">' + esc(c.tagline) + "</p></section>" +
        (c.hero ? '<div class="hero-figure"><img src="' + esc(c.hero) + '" alt="' + esc(c.name) + '"></div>' : "") +
        heroStatsWrap(c) +
        aboutBlk(c, "01 — GIỚI THIỆU", "Về chúng tôi") +
        servicesBlk(c, "02 — DỊCH VỤ", "Những gì chúng tôi làm") +
        whyBlk(c, "03 — GIÁ TRỊ", "Cam kết") +
        processBlk(c, "04 — QUY TRÌNH", "Cách chúng tôi làm việc") +
        projectsBlk(c, "05 — DỰ ÁN", "Công trình chọn lọc") +
        stylesBlk(c, "06 — PHONG CÁCH", "Phong cách") +
        contactBlk(c) + footer(c);
    }
  };
  function heroStatsWrap(c) { return has(c.stats) ? '<section class="hero">' + statsRow(c) + "</section>" : ""; }

  /* =========================================================
     T4 — EDITORIAL BOLD  (đại tự · đỏ · magazine)
  ========================================================= */
  T.t4 = {
    name: "Editorial Bold", desc: "Chữ lớn · Đỏ · Tạp chí, mạnh mẽ",
    fonts: ["Montserrat:wght@400;500;600;700;800;900"],
    css: "\
.tpl.t4{--tx:#0E0E0E;--bg:#F4F1EC;--red:#E63325;--mut:#6b6b6b;--line:#d9d5cc;font-family:'Montserrat',sans-serif;color:var(--tx);background:var(--bg)}\
.tpl.t4 .site-head{display:flex;align-items:center;justify-content:space-between;padding:16px clamp(20px,4vw,48px);border-bottom:2px solid var(--tx)}\
.tpl.t4 .logo{height:38px}.tpl.t4[data-loginv='1'] .logo{filter:brightness(0)}.tpl.t4 .logo-txt{font-family:'Montserrat',sans-serif;font-size:22px;text-transform:uppercase;letter-spacing:-.02em}\
.tpl.t4 .head-right{display:flex;gap:16px;align-items:center;font-size:13px;font-weight:600}.tpl.t4 .back{color:var(--mut)}.tpl.t4 .head-cta{background:var(--red);color:#fff;padding:9px 16px}\
.tpl.t4 .hero{padding:clamp(30px,5vw,60px) clamp(20px,4vw,48px) 0;max-width:1280px;margin:0 auto}\
.tpl.t4 .hero-badge{display:inline-block;background:var(--tx);color:var(--bg);font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.06em;padding:6px 12px;margin-bottom:24px}\
.tpl.t4 .hero h1{font-family:'Montserrat',sans-serif;font-size:clamp(48px,11vw,150px);line-height:.92;letter-spacing:-.04em;text-transform:uppercase;margin:0}\
.tpl.t4 .hero h1 span{color:var(--red)}\
.tpl.t4 .hero-tag{font-size:clamp(17px,2vw,23px);font-weight:500;max-width:620px;margin:26px 0 34px}\
.tpl.t4 .hero-img{width:100%;aspect-ratio:16/7;object-fit:cover;border:2px solid var(--tx)}\
.tpl.t4 .hero .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));border:2px solid var(--tx);border-top:0}\
.tpl.t4 .stat{padding:24px;border-right:2px solid var(--tx)}.tpl.t4 .stat:last-child{border-right:0}\
.tpl.t4 .stat-n{font-family:'Montserrat',sans-serif;font-size:clamp(28px,3.5vw,44px);line-height:1}.tpl.t4 .stat-l{font-size:12px;font-weight:600;text-transform:uppercase;color:var(--mut);margin-top:8px}\
.tpl.t4 .sec{max-width:1280px;margin:0 auto;padding:clamp(50px,7vw,90px) clamp(20px,4vw,48px)}\
.tpl.t4 .eyebrow{color:var(--red);font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:13px;margin-bottom:12px}\
.tpl.t4 .sec-title{font-family:'Montserrat',sans-serif;font-size:clamp(30px,5vw,64px);text-transform:uppercase;letter-spacing:-.03em;line-height:.98;margin:0 0 40px}\
.tpl.t4 .sec-about{border-top:2px solid var(--tx);border-bottom:2px solid var(--tx);max-width:none}.tpl.t4 .about-grid{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1.1fr .9fr;gap:0}\
.tpl.t4 .about-txt{padding:clamp(40px,6vw,80px) clamp(20px,4vw,48px)}.tpl.t4 .about-media{border-left:2px solid var(--tx)}.tpl.t4 .about-media img{width:100%;height:100%;object-fit:cover;min-height:360px}\
.tpl.t4 .about-p{font-size:17px;line-height:1.7;margin:0 0 18px}\
.tpl.t4 .svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0;border:2px solid var(--tx)}\
.tpl.t4 .svc{padding:32px 26px;border-right:2px solid var(--tx);border-bottom:2px solid var(--tx)}\
.tpl.t4 .svc-num{font-family:'Montserrat',sans-serif;font-size:34px;color:var(--red);margin-bottom:12px}.tpl.t4 .svc-title{font-size:19px;font-weight:700;text-transform:uppercase;margin:0 0 10px}.tpl.t4 .svc-desc{font-size:14px;line-height:1.6;color:var(--mut);margin:0}\
.tpl.t4 .why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:28px}\
.tpl.t4 .why{padding-top:20px;border-top:3px solid var(--red)}.tpl.t4 .why-num{font-family:'Montserrat',sans-serif;font-size:15px;margin-bottom:10px}.tpl.t4 .why-title{font-size:17px;font-weight:700;margin:0 0 8px;text-transform:uppercase}.tpl.t4 .why-desc{font-size:14px;line-height:1.6;color:var(--mut);margin:0}\
.tpl.t4 .proc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0;border-top:2px solid var(--tx)}\
.tpl.t4 .proc{padding:28px 22px;border-bottom:2px solid var(--tx)}.tpl.t4 .proc-num{font-family:'Montserrat',sans-serif;font-size:40px;-webkit-text-stroke:2px var(--tx);color:transparent;margin-bottom:12px}.tpl.t4 .proc-title{font-size:16px;font-weight:700;text-transform:uppercase;margin:0 0 6px}.tpl.t4 .proc-desc{font-size:13.5px;line-height:1.6;color:var(--mut);margin:0}\
.tpl.t4 .sec-projects{background:var(--tx);color:var(--bg);max-width:none}.tpl.t4 .sec-projects>*{max-width:1280px;margin-left:auto;margin-right:auto}.tpl.t4 .sec-projects .sec-title{color:var(--bg)}\
.tpl.t4 .proj-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}\
.tpl.t4 .proj-imgwrap{position:relative;aspect-ratio:4/3;overflow:hidden;border:2px solid var(--bg)}.tpl.t4 .proj-img{width:100%;height:100%;object-fit:cover}\
.tpl.t4 .proj-badge{position:absolute;top:0;left:0;background:var(--red);color:#fff;font-weight:700;font-size:11px;text-transform:uppercase;padding:6px 12px}\
.tpl.t4 .proj-title{font-family:'Montserrat',sans-serif;font-size:20px;text-transform:uppercase;margin:14px 0 4px}.tpl.t4 .proj-meta{font-size:13px;color:#bdb8ae;margin:0}\
.tpl.t4 .style-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0;border:2px solid var(--tx)}\
.tpl.t4 .style{padding:28px 24px;border-right:2px solid var(--tx)}.tpl.t4 .style-num{color:var(--red);font-weight:700;margin-bottom:10px}.tpl.t4 .style-name{font-family:'Montserrat',sans-serif;font-size:20px;text-transform:uppercase;margin:0 0 8px}.tpl.t4 .style-desc{font-size:13.5px;line-height:1.6;color:var(--mut);margin:0}\
.tpl.t4 .sec-contact{border-top:2px solid var(--tx);max-width:none}.tpl.t4 .contact-wrap{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:0}\
.tpl.t4 .contact-left{padding:clamp(40px,6vw,80px) clamp(20px,4vw,48px) clamp(40px,6vw,80px) 0}\
.tpl.t4 .contact-lead{font-size:16px;line-height:1.7;margin:0 0 26px}.tpl.t4 .c-label{color:var(--red);font-weight:700;font-size:12px;text-transform:uppercase;margin-bottom:4px}.tpl.t4 .c-item{margin-bottom:16px}.tpl.t4 .c-phone a{font-family:'Montserrat',sans-serif;font-size:22px}\
.tpl.t4 .c-social{display:flex;gap:16px;margin-top:20px;font-weight:600}\
.tpl.t4 .contact-form{background:var(--tx);color:var(--bg);padding:36px;display:flex;flex-direction:column;gap:12px}\
.tpl.t4 .contact-form h3{font-family:'Montserrat',sans-serif;text-transform:uppercase;font-size:20px;margin:0 0 6px}\
.tpl.t4 .contact-form input,.tpl.t4 .contact-form textarea{background:transparent;border:2px solid #444;color:#fff;padding:13px;font-family:inherit;font-size:14px}\
.tpl.t4 .contact-form button{background:var(--red);color:#fff;border:0;padding:15px;font-weight:700;text-transform:uppercase;cursor:pointer;font-family:inherit}.tpl.t4 .ok{color:#8ee89a;font-size:13px}\
.tpl.t4 .site-foot{border-top:2px solid var(--tx);padding:28px clamp(20px,4vw,48px);display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-weight:600;font-size:13px}\
@media(max-width:820px){.tpl.t4 .about-grid,.tpl.t4 .contact-wrap{grid-template-columns:1fr}.tpl.t4 .about-media{border-left:0;border-top:2px solid var(--tx)}}",
    render: function (c) {
      var nm = esc(c.name);
      return header(c, "Báo giá") +
        '<section class="hero">' +
        (c.badge ? '<span class="hero-badge">' + esc(c.badge) + "</span>" : "") +
        "<h1>" + nm + "<span>.</span></h1>" +
        '<p class="hero-tag">' + esc(c.tagline) + (has(c.about) ? " " + esc(c.about[0]) : "") + "</p>" +
        (c.hero ? '<img class="hero-img" src="' + esc(c.hero) + '" alt="' + nm + '">' : "") +
        statsRow(c) + "</section>" +
        aboutBlk(c, "GIỚI THIỆU", "Chúng tôi là ai") +
        servicesBlk(c, "DỊCH VỤ", "Dịch vụ") +
        whyBlk(c, "LÝ DO", "Vì sao chọn") +
        processBlk(c, "QUY TRÌNH", "Quy trình") +
        projectsBlk(c, "DỰ ÁN", "Công trình") +
        stylesBlk(c, "PHONG CÁCH", "Phong cách") +
        contactBlk(c) + footer(c);
    }
  };

  /* =========================================================
     T5 — FOREST  (xanh rêu · sand · Fraunces serif)
  ========================================================= */
  T.t5 = {
    name: "Forest", desc: "Xanh rêu · Cát · Serif mềm — mộc, gần gũi",
    fonts: ["Montserrat:wght@400;500;600;700;800;900"],
    css: "\
.tpl.t5{--grn:#1F3D30;--grn2:#2F5A46;--sand:#EDE7D7;--cream:#F6F2E9;--tx:#22271F;--mut:#5f6b5c;--acc:#B98A3E;--line:#dcd6c6;font-family:'Montserrat',sans-serif;color:var(--tx);background:var(--cream)}\
.tpl.t5 .site-head{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;padding:16px clamp(20px,4vw,48px);background:var(--cream);border-bottom:1px solid var(--line)}\
.tpl.t5 .logo{height:40px}.tpl.t5[data-loginv='1'] .logo{filter:brightness(0)}.tpl.t5 .logo-txt{font-family:'Montserrat',sans-serif;font-size:24px;font-weight:600;color:var(--grn)}\
.tpl.t5 .head-right{display:flex;gap:16px;align-items:center;font-size:13px}.tpl.t5 .back{color:var(--mut)}.tpl.t5 .head-cta{background:var(--grn);color:var(--cream);padding:10px 18px;border-radius:100px;font-weight:600}\
.tpl.t5 .hero{position:relative;min-height:clamp(520px,80vh,760px);display:flex;align-items:flex-end;color:var(--cream);background-size:cover;background-position:center}\
.tpl.t5 .hero::after{content:'';position:absolute;inset:0;background:linear-gradient(0deg,rgba(20,32,26,.94),rgba(20,32,26,.3) 65%)}\
.tpl.t5 .hero-inner{position:relative;z-index:1;max-width:1180px;margin:0 auto;width:100%;padding:clamp(40px,7vw,70px) clamp(20px,4vw,48px)}\
.tpl.t5 .hero-badge{display:inline-block;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);padding:7px 15px;border-radius:100px;font-size:12.5px;margin-bottom:20px}\
.tpl.t5 .hero h1{font-family:'Montserrat',sans-serif;font-weight:500;font-size:clamp(38px,6vw,72px);line-height:1.05;margin:0 0 16px;max-width:760px}\
.tpl.t5 .hero-tag{font-size:clamp(16px,1.6vw,19px);color:rgba(255,255,255,.9);max-width:540px;margin:0 0 30px}\
.tpl.t5 .hero .stats{display:flex;flex-wrap:wrap;gap:clamp(24px,4vw,54px);border-top:1px solid rgba(255,255,255,.25);padding-top:24px}\
.tpl.t5 .stat-n{font-family:'Montserrat',sans-serif;font-size:clamp(24px,3.2vw,36px);font-weight:500}.tpl.t5 .stat-l{font-size:12.5px;color:rgba(255,255,255,.82);margin-top:6px}\
.tpl.t5 .sec{max-width:1180px;margin:0 auto;padding:clamp(54px,8vw,100px) clamp(20px,4vw,48px)}\
.tpl.t5 .eyebrow{font-size:12.5px;font-weight:700;letter-spacing:.1em;color:var(--acc);text-transform:uppercase;margin-bottom:12px}\
.tpl.t5 .sec-title{font-family:'Montserrat',sans-serif;font-weight:500;font-size:clamp(27px,3.6vw,44px);margin:0 0 38px}\
.tpl.t5 .sec-about{background:var(--grn);color:var(--cream);max-width:none}.tpl.t5 .about-grid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(240px,400px) 1fr;gap:52px;align-items:center}\
.tpl.t5 .about-media img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:200px 200px 12px 12px}\
.tpl.t5 .sec-about .eyebrow{color:#d8b877}.tpl.t5 .about-p{color:rgba(255,255,255,.8);line-height:1.85;margin:0 0 16px}\
.tpl.t5 .svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px}\
.tpl.t5 .svc{background:var(--sand);border-radius:18px;padding:30px 26px}.tpl.t5 .svc-num{font-family:'Montserrat',sans-serif;color:var(--grn2);font-size:26px;margin-bottom:12px}.tpl.t5 .svc-title{font-family:'Montserrat',sans-serif;font-size:20px;font-weight:600;margin:0 0 10px}.tpl.t5 .svc-desc{font-size:14px;line-height:1.65;color:var(--mut);margin:0}\
.tpl.t5 .why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:28px 36px}\
.tpl.t5 .why{display:flex;gap:16px}.tpl.t5 .why-num{font-family:'Montserrat',sans-serif;color:var(--acc);font-size:34px;line-height:1}.tpl.t5 .why-title{font-size:16px;margin:0 0 6px}.tpl.t5 .why-desc{font-size:14px;line-height:1.6;color:var(--mut);margin:0}\
.tpl.t5 .sec-process{background:var(--sand);max-width:none}.tpl.t5 .sec-process>*{max-width:1180px;margin-left:auto;margin-right:auto}\
.tpl.t5 .proc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:26px}\
.tpl.t5 .proc{background:var(--cream);border-radius:16px;padding:26px 22px}.tpl.t5 .proc-num{font-family:'Montserrat',sans-serif;color:var(--grn);font-size:36px;margin-bottom:10px}.tpl.t5 .proc-title{font-size:16px;margin:0 0 6px}.tpl.t5 .proc-desc{font-size:13.5px;line-height:1.6;color:var(--mut);margin:0}\
.tpl.t5 .proj-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:22px}\
.tpl.t5 .proj{border-radius:18px;overflow:hidden;background:var(--sand)}.tpl.t5 .proj-imgwrap{position:relative;aspect-ratio:4/3}.tpl.t5 .proj-img{width:100%;height:100%;object-fit:cover}\
.tpl.t5 .proj-badge{position:absolute;top:12px;left:12px;background:var(--grn);color:var(--cream);font-size:11px;padding:5px 12px;border-radius:100px}\
.tpl.t5 .proj-body{padding:18px 20px}.tpl.t5 .proj-title{font-family:'Montserrat',sans-serif;font-size:18px;font-weight:600;margin:0 0 5px}.tpl.t5 .proj-meta{font-size:13px;color:var(--mut);margin:0}\
.tpl.t5 .style-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}.tpl.t5 .style{background:var(--sand);border-radius:18px;padding:28px}.tpl.t5 .style-num{color:var(--acc);font-family:'Montserrat',sans-serif;font-size:22px;margin-bottom:8px}.tpl.t5 .style-name{font-family:'Montserrat',sans-serif;font-size:19px;font-weight:600;margin:0 0 8px}.tpl.t5 .style-desc{font-size:13.5px;line-height:1.7;color:var(--mut);margin:0}\
.tpl.t5 .sec-contact{background:var(--grn);color:var(--cream);max-width:none}.tpl.t5 .contact-wrap{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px}\
.tpl.t5 .sec-contact .eyebrow{color:#d8b877}.tpl.t5 .contact-lead{color:rgba(255,255,255,.78);line-height:1.7;margin:0 0 26px}\
.tpl.t5 .c-label{color:#d8b877;font-size:11.5px;letter-spacing:.06em;margin-bottom:3px}.tpl.t5 .c-item{margin-bottom:16px}.tpl.t5 .c-phone a{font-family:'Montserrat',sans-serif;font-size:21px}\
.tpl.t5 .c-social{display:flex;gap:16px;margin-top:20px;color:#d8b877;font-size:13.5px}\
.tpl.t5 .contact-form{background:var(--cream);color:var(--tx);border-radius:18px;padding:30px;display:flex;flex-direction:column;gap:12px}.tpl.t5 .contact-form h3{font-family:'Montserrat',sans-serif;font-size:21px;font-weight:600;margin:0 0 6px}\
.tpl.t5 .contact-form input,.tpl.t5 .contact-form textarea{background:var(--sand);border:1px solid var(--line);border-radius:10px;padding:12px 15px;font-family:inherit;font-size:14px}\
.tpl.t5 .contact-form button{background:var(--grn);color:var(--cream);border:0;padding:14px;border-radius:100px;font-weight:600;cursor:pointer;font-family:inherit}.tpl.t5 .ok{color:#2E7D32;font-size:13px}\
.tpl.t5 .site-foot{background:#16261E;color:rgba(255,255,255,.6);padding:30px clamp(20px,4vw,48px);display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;font-size:13px}.tpl.t5 .foot-links a{color:#d8b877}\
@media(max-width:820px){.tpl.t5 .about-grid,.tpl.t5 .contact-wrap{grid-template-columns:1fr}.tpl.t5 .about-media{display:none}}",
    render: function (c) {
      return header(c, "Đặt lịch") +
        '<section class="hero" style="' + bg(c.hero) + '"><div class="hero-inner">' +
        (c.badge ? '<span class="hero-badge">' + esc(c.badge) + "</span>" : "") +
        "<h1>" + esc(c.name) + " — " + esc(c.tagline) + "</h1>" +
        (has(c.about) ? '<p class="hero-tag">' + esc(c.about[0]) + "</p>" : "") +
        heroStats(c) + "</div></section>" +
        aboutBlk(c, "GIỚI THIỆU", "Câu chuyện của " + c.name) +
        servicesBlk(c, "DỊCH VỤ", "Chúng tôi mang đến") +
        whyBlk(c, "GIÁ TRỊ", "Điều làm nên khác biệt") +
        processBlk(c, "QUY TRÌNH", "Từng bước chỉn chu") +
        projectsBlk(c, "CÔNG TRÌNH", "Không gian đã kiến tạo") +
        stylesBlk(c, "PHONG CÁCH", "Phong cách thiết kế") +
        contactBlk(c) + footer(c);
    }
  };

  /* =========================================================
     T6 — OCEAN CORPORATE  (xanh dương · chuyên nghiệp)
  ========================================================= */
  T.t6 = {
    name: "Ocean Corporate", desc: "Xanh dương · Sạch sẽ — chuyên nghiệp",
    fonts: ["Montserrat:wght@400;500;600;700;800;900"],
    css: "\
.tpl.t6{--blue:#0B4F7A;--blue2:#1877B8;--sky:#E9F2F8;--tx:#12212B;--mut:#5c6b74;--line:#dce6ec;font-family:'Montserrat',sans-serif;color:var(--tx);background:#fff}\
.tpl.t6 .site-head{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;padding:14px clamp(20px,4vw,48px);background:#fffffff2;backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}\
.tpl.t6 .logo{height:38px}.tpl.t6[data-loginv='1'] .logo{filter:brightness(0)}.tpl.t6 .logo-txt{font-weight:800;font-size:21px;color:var(--blue)}\
.tpl.t6 .head-right{display:flex;gap:16px;align-items:center;font-size:13px}.tpl.t6 .back{color:var(--mut)}.tpl.t6 .head-cta{background:var(--blue);color:#fff;padding:10px 18px;border-radius:8px;font-weight:600}\
.tpl.t6 .hero{background:linear-gradient(160deg,var(--blue) 0%,#0a3d60 100%);color:#fff;position:relative;overflow:hidden}\
.tpl.t6 .hero-inner{max-width:1200px;margin:0 auto;padding:clamp(50px,8vw,90px) clamp(20px,4vw,48px);display:grid;grid-template-columns:1.1fr .9fr;gap:48px;align-items:center}\
.tpl.t6 .hero-badge{display:inline-block;background:rgba(255,255,255,.15);padding:7px 15px;border-radius:8px;font-size:12.5px;font-weight:600;margin-bottom:20px}\
.tpl.t6 .hero h1{font-size:clamp(32px,4.6vw,54px);font-weight:800;line-height:1.1;letter-spacing:-.02em;margin:0 0 16px}\
.tpl.t6 .hero-tag{font-size:clamp(15px,1.5vw,18px);color:rgba(255,255,255,.85);margin:0 0 28px;line-height:1.6}\
.tpl.t6 .hero-media img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px;box-shadow:0 30px 60px -20px rgba(0,0,0,.5)}\
.tpl.t6 .hero .stats{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:20px;border-top:1px solid rgba(255,255,255,.2);padding-top:28px;margin-top:8px}\
.tpl.t6 .stat-n{font-size:clamp(24px,3vw,34px);font-weight:800}.tpl.t6 .stat-l{font-size:12.5px;color:rgba(255,255,255,.8);margin-top:5px}\
.tpl.t6 .sec{max-width:1200px;margin:0 auto;padding:clamp(52px,8vw,96px) clamp(20px,4vw,48px)}\
.tpl.t6 .eyebrow{color:var(--blue2);font-weight:700;letter-spacing:.06em;font-size:12.5px;text-transform:uppercase;margin-bottom:10px}\
.tpl.t6 .sec-title{font-size:clamp(25px,3.2vw,38px);font-weight:800;letter-spacing:-.02em;margin:0 0 36px}\
.tpl.t6 .sec-about{background:var(--sky);max-width:none}.tpl.t6 .about-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:minmax(240px,420px) 1fr;gap:48px;align-items:center}\
.tpl.t6 .about-media img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px}.tpl.t6 .about-p{color:#3a4a53;line-height:1.8;margin:0 0 16px}\
.tpl.t6 .svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}\
.tpl.t6 .svc{border:1px solid var(--line);border-radius:14px;padding:28px 24px;transition:.2s}.tpl.t6 .svc:hover{border-color:var(--blue2);box-shadow:0 12px 30px -16px rgba(11,79,122,.4)}\
.tpl.t6 .svc-num{width:40px;height:40px;border-radius:10px;background:var(--sky);color:var(--blue);font-weight:800;display:flex;align-items:center;justify-content:center;margin-bottom:16px}.tpl.t6 .svc-title{font-size:17px;font-weight:700;margin:0 0 8px}.tpl.t6 .svc-desc{font-size:14px;line-height:1.6;color:var(--mut);margin:0}\
.tpl.t6 .sec-why{background:var(--blue);color:#fff;max-width:none}.tpl.t6 .sec-why>*{max-width:1200px;margin-left:auto;margin-right:auto}.tpl.t6 .sec-why .eyebrow{color:#7fc0ec}\
.tpl.t6 .why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:26px}.tpl.t6 .why{display:flex;gap:14px}.tpl.t6 .why-num{color:#7fc0ec;font-weight:800;font-size:24px}.tpl.t6 .why-title{font-size:16px;margin:0 0 6px}.tpl.t6 .why-desc{font-size:13.5px;line-height:1.6;color:rgba(255,255,255,.75);margin:0}\
.tpl.t6 .proc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;counter-reset:none}\
.tpl.t6 .proc{position:relative;padding-top:20px;border-top:3px solid var(--sky)}.tpl.t6 .proc-num{color:var(--blue2);font-weight:800;font-size:28px;margin-bottom:8px}.tpl.t6 .proc-title{font-size:16px;margin:0 0 6px}.tpl.t6 .proc-desc{font-size:13.5px;line-height:1.6;color:var(--mut);margin:0}\
.tpl.t6 .sec-projects{background:var(--sky);max-width:none}.tpl.t6 .sec-projects>*{max-width:1200px;margin-left:auto;margin-right:auto}\
.tpl.t6 .proj-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:22px}.tpl.t6 .proj{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px -18px rgba(11,79,122,.3)}\
.tpl.t6 .proj-imgwrap{position:relative;aspect-ratio:4/3}.tpl.t6 .proj-img{width:100%;height:100%;object-fit:cover}.tpl.t6 .proj-badge{position:absolute;top:12px;left:12px;background:var(--blue);color:#fff;font-size:11px;font-weight:600;padding:5px 12px;border-radius:8px}\
.tpl.t6 .proj-body{padding:18px 20px}.tpl.t6 .proj-title{font-size:16px;font-weight:700;margin:0 0 5px}.tpl.t6 .proj-meta{font-size:13px;color:var(--mut);margin:0}\
.tpl.t6 .style-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}.tpl.t6 .style{border:1px solid var(--line);border-radius:14px;padding:26px}.tpl.t6 .style-num{color:var(--blue2);font-weight:800;margin-bottom:8px}.tpl.t6 .style-name{font-size:18px;font-weight:700;margin:0 0 8px}.tpl.t6 .style-desc{font-size:14px;line-height:1.65;color:var(--mut);margin:0}\
.tpl.t6 .sec-contact{background:var(--blue);color:#fff;max-width:none}.tpl.t6 .contact-wrap{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px}.tpl.t6 .sec-contact .eyebrow{color:#7fc0ec}\
.tpl.t6 .contact-lead{color:rgba(255,255,255,.8);line-height:1.7;margin:0 0 26px}.tpl.t6 .c-label{color:#7fc0ec;font-size:11.5px;letter-spacing:.05em;margin-bottom:3px}.tpl.t6 .c-item{margin-bottom:16px}.tpl.t6 .c-phone a{font-size:18px;font-weight:700}\
.tpl.t6 .c-social{display:flex;gap:16px;margin-top:20px;color:#7fc0ec;font-size:13.5px}\
.tpl.t6 .contact-form{background:#fff;color:var(--tx);border-radius:16px;padding:30px;display:flex;flex-direction:column;gap:12px}.tpl.t6 .contact-form h3{font-size:19px;margin:0 0 6px}\
.tpl.t6 .contact-form input,.tpl.t6 .contact-form textarea{border:1px solid var(--line);border-radius:9px;padding:12px 15px;font-family:inherit;font-size:14px}\
.tpl.t6 .contact-form button{background:var(--blue);color:#fff;border:0;padding:14px;border-radius:9px;font-weight:600;cursor:pointer;font-family:inherit}.tpl.t6 .ok{color:#2E7D32;font-size:13px}\
.tpl.t6 .site-foot{background:#0a3d60;color:rgba(255,255,255,.7);padding:30px clamp(20px,4vw,48px);display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;font-size:13px}.tpl.t6 .foot-links a{color:#7fc0ec}\
@media(max-width:820px){.tpl.t6 .hero-inner,.tpl.t6 .about-grid,.tpl.t6 .contact-wrap{grid-template-columns:1fr}.tpl.t6 .about-media{display:none}}",
    render: function (c) {
      return header(c, "Tư vấn") +
        '<section class="hero"><div class="hero-inner">' +
        '<div><div>' + (c.badge ? '<span class="hero-badge">' + esc(c.badge) + "</span>" : "") + "</div>" +
        "<h1>" + esc(c.name) + " — " + esc(c.tagline) + "</h1>" +
        (has(c.about) ? '<p class="hero-tag">' + esc(c.about[0]) + "</p>" : "") + "</div>" +
        (c.hero ? '<div class="hero-media"><img src="' + esc(c.hero) + '" alt="' + esc(c.name) + '"></div>' : "") +
        heroStats(c) + "</div></section>" +
        aboutBlk(c, "GIỚI THIỆU", "Về " + c.name) +
        servicesBlk(c, "DỊCH VỤ", "Dịch vụ cung cấp") +
        whyBlk(c, "CAM KẾT", "Vì sao chọn " + c.name) +
        processBlk(c, "QUY TRÌNH", "Quy trình 4 bước") +
        projectsBlk(c, "DỰ ÁN", "Dự án đã thực hiện") +
        stylesBlk(c, "PHONG CÁCH", "Phong cách thiết kế") +
        contactBlk(c) + footer(c);
    }
  };

  /* =========================================================
     T7 — SUNSET WARM  (cam/hồng gradient · bo tròn · Poppins)
  ========================================================= */
  T.t7 = {
    name: "Sunset Warm", desc: "Cam · Hồng · Bo tròn — trẻ trung, thân thiện",
    fonts: ["Montserrat:wght@400;500;600;700;800;900"],
    css: "\
.tpl.t7{--o1:#FF7A45;--o2:#FF4D8D;--am:#FFB65C;--cream:#FFF6EF;--tx:#2B1E1A;--mut:#7c6a63;--line:#F1E2D8;font-family:'Montserrat',sans-serif;color:var(--tx);background:var(--cream)}\
.tpl.t7 .site-head{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;padding:14px clamp(20px,4vw,48px);background:#fff8f3e6;backdrop-filter:blur(8px)}\
.tpl.t7 .logo{height:38px}.tpl.t7[data-loginv='1'] .logo{filter:brightness(0)}.tpl.t7 .logo-txt{font-weight:800;font-size:21px;background:linear-gradient(90deg,var(--o1),var(--o2));-webkit-background-clip:text;background-clip:text;color:transparent}\
.tpl.t7 .head-right{display:flex;gap:16px;align-items:center;font-size:13px}.tpl.t7 .back{color:var(--mut)}.tpl.t7 .head-cta{background:linear-gradient(90deg,var(--o1),var(--o2));color:#fff;padding:10px 20px;border-radius:100px;font-weight:600}\
.tpl.t7 .hero{position:relative;padding:clamp(50px,8vw,96px) clamp(20px,4vw,48px);max-width:1180px;margin:0 auto;text-align:center}\
.tpl.t7 .hero-badge{display:inline-block;background:#fff;border:1px solid var(--line);color:var(--o2);padding:8px 18px;border-radius:100px;font-size:12.5px;font-weight:600;margin-bottom:22px}\
.tpl.t7 .hero h1{font-size:clamp(34px,6vw,66px);font-weight:800;line-height:1.08;letter-spacing:-.02em;margin:0 auto 18px;max-width:900px}\
.tpl.t7 .hero h1 span{background:linear-gradient(90deg,var(--o1),var(--o2));-webkit-background-clip:text;background-clip:text;color:transparent}\
.tpl.t7 .hero-tag{font-size:clamp(16px,1.7vw,19px);color:var(--mut);max-width:560px;margin:0 auto 30px}\
.tpl.t7 .hero-img{width:100%;max-width:1100px;aspect-ratio:16/8;object-fit:cover;border-radius:28px;box-shadow:0 30px 70px -30px rgba(255,77,141,.5)}\
.tpl.t7 .hero .stats{display:flex;justify-content:center;flex-wrap:wrap;gap:clamp(24px,4vw,56px);margin-top:40px}\
.tpl.t7 .stat-n{font-size:clamp(26px,3.4vw,40px);font-weight:800;background:linear-gradient(90deg,var(--o1),var(--o2));-webkit-background-clip:text;background-clip:text;color:transparent}.tpl.t7 .stat-l{font-size:12.5px;color:var(--mut);margin-top:4px}\
.tpl.t7 .sec{max-width:1180px;margin:0 auto;padding:clamp(48px,7vw,88px) clamp(20px,4vw,48px)}\
.tpl.t7 .sec-head{text-align:center}.tpl.t7 .eyebrow{font-weight:700;letter-spacing:.05em;font-size:12.5px;color:var(--o2);text-transform:uppercase;margin-bottom:10px}\
.tpl.t7 .sec-title{font-size:clamp(25px,3.4vw,40px);font-weight:800;letter-spacing:-.02em;margin:0 auto 40px;max-width:640px}\
.tpl.t7 .about-grid{display:grid;grid-template-columns:minmax(240px,420px) 1fr;gap:48px;align-items:center;text-align:left}\
.tpl.t7 .about-media img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:24px}.tpl.t7 .about-p{color:#5a4c46;line-height:1.8;margin:0 0 16px}\
.tpl.t7 .svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px;text-align:left}\
.tpl.t7 .svc{background:#fff;border-radius:22px;padding:28px 24px;box-shadow:0 14px 34px -22px rgba(255,122,69,.5)}.tpl.t7 .svc-num{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,var(--o1),var(--o2));color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center;margin-bottom:16px}.tpl.t7 .svc-title{font-size:17px;font-weight:700;margin:0 0 8px}.tpl.t7 .svc-desc{font-size:14px;line-height:1.6;color:var(--mut);margin:0}\
.tpl.t7 .why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;text-align:left}.tpl.t7 .why{background:#fff;border-radius:20px;padding:26px;display:flex;gap:14px}.tpl.t7 .why-num{font-size:26px;font-weight:800;color:var(--am)}.tpl.t7 .why-title{font-size:16px;margin:0 0 6px}.tpl.t7 .why-desc{font-size:13.5px;line-height:1.6;color:var(--mut);margin:0}\
.tpl.t7 .sec-process{max-width:none;background:linear-gradient(120deg,var(--o1),var(--o2));color:#fff}.tpl.t7 .sec-process>*{max-width:1180px;margin-left:auto;margin-right:auto}.tpl.t7 .sec-process .eyebrow{color:rgba(255,255,255,.85)}\
.tpl.t7 .proc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:22px;text-align:left}.tpl.t7 .proc{background:rgba(255,255,255,.15);border-radius:18px;padding:24px}.tpl.t7 .proc-num{font-size:32px;font-weight:800;margin-bottom:8px}.tpl.t7 .proc-title{font-size:16px;margin:0 0 6px}.tpl.t7 .proc-desc{font-size:13.5px;line-height:1.6;color:rgba(255,255,255,.85);margin:0}\
.tpl.t7 .proj-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:22px;text-align:left}.tpl.t7 .proj{background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 14px 34px -22px rgba(255,77,141,.4)}.tpl.t7 .proj-imgwrap{position:relative;aspect-ratio:4/3}.tpl.t7 .proj-img{width:100%;height:100%;object-fit:cover}.tpl.t7 .proj-badge{position:absolute;top:12px;left:12px;background:linear-gradient(90deg,var(--o1),var(--o2));color:#fff;font-size:11px;font-weight:600;padding:5px 12px;border-radius:100px}.tpl.t7 .proj-body{padding:18px 20px}.tpl.t7 .proj-title{font-size:16px;font-weight:700;margin:0 0 5px}.tpl.t7 .proj-meta{font-size:13px;color:var(--mut);margin:0}\
.tpl.t7 .style-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;text-align:left}.tpl.t7 .style{background:#fff;border-radius:22px;padding:28px}.tpl.t7 .style-num{font-weight:800;color:var(--o2);margin-bottom:8px}.tpl.t7 .style-name{font-size:18px;font-weight:700;margin:0 0 8px}.tpl.t7 .style-desc{font-size:14px;line-height:1.65;color:var(--mut);margin:0}\
.tpl.t7 .sec-contact{max-width:none;background:#fff}.tpl.t7 .contact-wrap{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;text-align:left}.tpl.t7 .contact-left .sec-head{text-align:left}\
.tpl.t7 .contact-lead{color:var(--mut);line-height:1.7;margin:0 0 24px}.tpl.t7 .c-label{color:var(--o2);font-size:11.5px;font-weight:600;letter-spacing:.05em;margin-bottom:3px}.tpl.t7 .c-item{margin-bottom:16px}.tpl.t7 .c-phone a{font-size:19px;font-weight:700}\
.tpl.t7 .c-social{display:flex;gap:16px;margin-top:20px;color:var(--o2);font-size:13.5px;font-weight:600}\
.tpl.t7 .contact-form{background:linear-gradient(150deg,var(--o1),var(--o2));color:#fff;border-radius:24px;padding:32px;display:flex;flex-direction:column;gap:12px}.tpl.t7 .contact-form h3{font-size:20px;margin:0 0 6px}\
.tpl.t7 .contact-form input,.tpl.t7 .contact-form textarea{background:rgba(255,255,255,.2);border:0;color:#fff;padding:13px 15px;border-radius:12px;font-family:inherit;font-size:14px}.tpl.t7 .contact-form input::placeholder,.tpl.t7 .contact-form textarea::placeholder{color:rgba(255,255,255,.8)}\
.tpl.t7 .contact-form button{background:#fff;color:var(--o2);border:0;padding:14px;border-radius:100px;font-weight:700;cursor:pointer;font-family:inherit}.tpl.t7 .ok{color:#fff;font-size:13px}\
.tpl.t7 .site-foot{padding:30px clamp(20px,4vw,48px);display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;font-size:13px;color:var(--mut);border-top:1px solid var(--line)}.tpl.t7 .foot-links a{color:var(--o2)}\
@media(max-width:820px){.tpl.t7 .about-grid,.tpl.t7 .contact-wrap{grid-template-columns:1fr}.tpl.t7 .about-media{display:none}}",
    render: function (c) {
      return header(c, "Tư vấn ngay") +
        '<section class="hero">' +
        (c.badge ? '<span class="hero-badge">' + esc(c.badge) + "</span>" : "") +
        "<h1>" + esc(c.name) + " <span>— " + esc(c.tagline) + "</span></h1>" +
        (has(c.about) ? '<p class="hero-tag">' + esc(c.about[0]) + "</p>" : "") +
        (c.hero ? '<img class="hero-img" src="' + esc(c.hero) + '" alt="' + esc(c.name) + '">' : "") +
        statsRow(c) + "</section>" +
        aboutBlk(c, "GIỚI THIỆU", "Về " + c.name) +
        servicesBlk(c, "DỊCH VỤ", "Chúng tôi giúp gì cho bạn") +
        whyBlk(c, "LÝ DO", "Vì sao yêu thích " + c.name) +
        processBlk(c, "QUY TRÌNH", "Đơn giản trong 4 bước") +
        projectsBlk(c, "DỰ ÁN", "Công trình nổi bật") +
        stylesBlk(c, "PHONG CÁCH", "Phong cách thiết kế") +
        contactBlk(c) + footer(c);
    }
  };

  /* =========================================================
     T8 — BLUEPRINT GRID  (kỹ thuật · mono · lưới)
  ========================================================= */
  T.t8 = {
    name: "Blueprint Grid", desc: "Kỹ thuật · Mono · Lưới — chính xác",
    fonts: ["Montserrat:wght@400;500;600;700;800;900"],
    css: "\
.tpl.t8{--bg:#0E1826;--pane:#132135;--cy:#4FD1C5;--tx:#D8E1EC;--mut:#7d8ba0;--line:#22344d;font-family:'Montserrat',sans-serif;color:var(--tx);background:var(--bg);background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:44px 44px}\
.tpl.t8 .site-head{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;padding:14px clamp(20px,4vw,48px);background:#0e1826e6;backdrop-filter:blur(6px);border-bottom:1px solid var(--line)}\
.tpl.t8 .logo{height:36px}.tpl.t8[data-loginv='1'] .logo{filter:brightness(0) invert(1)}.tpl.t8 .logo-txt{font-family:'Montserrat',sans-serif;font-size:19px;font-weight:600;color:var(--cy)}\
.tpl.t8 .head-right{display:flex;gap:16px;align-items:center;font-family:'Montserrat',sans-serif;font-size:12px}.tpl.t8 .back{color:var(--mut)}.tpl.t8 .head-cta{border:1px solid var(--cy);color:var(--cy);padding:8px 16px}\
.tpl.t8 .hero{max-width:1200px;margin:0 auto;padding:clamp(50px,8vw,96px) clamp(20px,4vw,48px)}\
.tpl.t8 .hero-badge{font-family:'Montserrat',sans-serif;color:var(--cy);font-size:12.5px;letter-spacing:.05em;display:block;margin-bottom:20px}.tpl.t8 .hero-badge::before{content:'// '}\
.tpl.t8 .hero h1{font-size:clamp(34px,5.4vw,60px);font-weight:700;line-height:1.06;letter-spacing:-.02em;margin:0 0 16px;max-width:820px}\
.tpl.t8 .hero-tag{font-family:'Montserrat',sans-serif;font-size:14px;color:var(--mut);max-width:560px;margin:0 0 30px;line-height:1.7}\
.tpl.t8 .hero-img{width:100%;aspect-ratio:16/7;object-fit:cover;border:1px solid var(--cy);filter:saturate(.9)}\
.tpl.t8 .hero .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));border:1px solid var(--line);border-top:0;background:var(--pane)}\
.tpl.t8 .stat{padding:22px;border-right:1px solid var(--line)}.tpl.t8 .stat-n{font-family:'Montserrat',sans-serif;font-size:clamp(24px,3vw,34px);color:var(--cy);line-height:1}.tpl.t8 .stat-l{font-family:'Montserrat',sans-serif;font-size:11px;color:var(--mut);margin-top:8px}\
.tpl.t8 .sec{max-width:1200px;margin:0 auto;padding:clamp(50px,7vw,88px) clamp(20px,4vw,48px)}\
.tpl.t8 .eyebrow{font-family:'Montserrat',sans-serif;color:var(--cy);font-size:12.5px;margin-bottom:12px}.tpl.t8 .eyebrow::before{content:'┌ '}\
.tpl.t8 .sec-title{font-size:clamp(24px,3.2vw,40px);font-weight:700;letter-spacing:-.02em;margin:0 0 36px}\
.tpl.t8 .about-grid{display:grid;grid-template-columns:1fr minmax(240px,400px);gap:44px;align-items:center;border:1px solid var(--line);background:var(--pane)}\
.tpl.t8 .about-txt{padding:clamp(30px,4vw,50px)}.tpl.t8 .about-media img{width:100%;height:100%;object-fit:cover;min-height:320px;border-left:1px solid var(--line)}.tpl.t8 .about-p{color:var(--mut);line-height:1.8;margin:0 0 16px}\
.tpl.t8 .svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0;border:1px solid var(--line);background:var(--pane)}\
.tpl.t8 .svc{padding:28px 24px;border-right:1px solid var(--line);border-bottom:1px solid var(--line)}.tpl.t8 .svc-num{font-family:'Montserrat',sans-serif;color:var(--cy);margin-bottom:12px}.tpl.t8 .svc-num::before{content:'0x'}.tpl.t8 .svc-title{font-size:17px;font-weight:600;margin:0 0 8px}.tpl.t8 .svc-desc{font-size:13.5px;line-height:1.6;color:var(--mut);margin:0}\
.tpl.t8 .why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:0;border:1px solid var(--line)}.tpl.t8 .why{padding:26px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--pane);display:flex;gap:14px}.tpl.t8 .why-num{font-family:'Montserrat',sans-serif;color:var(--cy)}.tpl.t8 .why-title{font-size:15px;margin:0 0 6px}.tpl.t8 .why-desc{font-size:13px;line-height:1.6;color:var(--mut);margin:0}\
.tpl.t8 .proc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px}.tpl.t8 .proc{border-left:2px solid var(--cy);padding-left:18px}.tpl.t8 .proc-num{font-family:'Montserrat',sans-serif;color:var(--cy);font-size:28px;margin-bottom:8px}.tpl.t8 .proc-title{font-size:15px;margin:0 0 6px}.tpl.t8 .proc-desc{font-size:13px;line-height:1.6;color:var(--mut);margin:0}\
.tpl.t8 .proj-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:2px;border:1px solid var(--line);background:var(--line)}.tpl.t8 .proj{background:var(--bg)}.tpl.t8 .proj-imgwrap{position:relative;aspect-ratio:4/3;overflow:hidden}.tpl.t8 .proj-img{width:100%;height:100%;object-fit:cover}.tpl.t8 .proj-badge{position:absolute;top:10px;left:10px;font-family:'Montserrat',sans-serif;background:rgba(14,24,38,.8);border:1px solid var(--cy);color:var(--cy);font-size:10.5px;padding:3px 9px}.tpl.t8 .proj-body{padding:16px 18px}.tpl.t8 .proj-title{font-size:15.5px;font-weight:600;margin:0 0 5px}.tpl.t8 .proj-meta{font-family:'Montserrat',sans-serif;font-size:12px;color:var(--mut);margin:0}\
.tpl.t8 .style-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px}.tpl.t8 .style{border:1px solid var(--line);background:var(--pane);padding:24px}.tpl.t8 .style-num{font-family:'Montserrat',sans-serif;color:var(--cy);margin-bottom:8px}.tpl.t8 .style-name{font-size:17px;font-weight:600;margin:0 0 8px}.tpl.t8 .style-desc{font-size:13px;line-height:1.65;color:var(--mut);margin:0}\
.tpl.t8 .contact-wrap{display:grid;grid-template-columns:1fr 1fr;gap:44px;border:1px solid var(--line);background:var(--pane);padding:clamp(30px,4vw,48px)}\
.tpl.t8 .contact-lead{color:var(--mut);line-height:1.7;margin:0 0 24px}.tpl.t8 .c-label{font-family:'Montserrat',sans-serif;color:var(--cy);font-size:11px;margin-bottom:4px}.tpl.t8 .c-item{margin-bottom:16px}.tpl.t8 .c-phone a{font-family:'Montserrat',sans-serif;font-size:18px;color:var(--cy)}\
.tpl.t8 .c-social{display:flex;gap:16px;margin-top:20px;font-family:'Montserrat',sans-serif;color:var(--cy);font-size:12.5px}\
.tpl.t8 .contact-form{display:flex;flex-direction:column;gap:12px}.tpl.t8 .contact-form h3{font-size:18px;margin:0 0 6px}.tpl.t8 .contact-form input,.tpl.t8 .contact-form textarea{background:var(--bg);border:1px solid var(--line);color:var(--tx);padding:12px 14px;font-family:'Montserrat',sans-serif;font-size:13px}.tpl.t8 .contact-form button{background:var(--cy);color:#06251f;border:0;padding:14px;font-weight:600;cursor:pointer;font-family:'Montserrat',sans-serif}.tpl.t8 .ok{color:var(--cy);font-size:12.5px;font-family:'Montserrat',sans-serif}\
.tpl.t8 .site-foot{border-top:1px solid var(--line);padding:26px clamp(20px,4vw,48px);display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:'Montserrat',sans-serif;font-size:12px;color:var(--mut)}.tpl.t8 .foot-links a{color:var(--cy)}\
@media(max-width:820px){.tpl.t8 .about-grid,.tpl.t8 .contact-wrap{grid-template-columns:1fr}.tpl.t8 .about-media img{border-left:0;border-top:1px solid var(--line)}}",
    render: function (c) {
      return header(c, "[ liên hệ ]") +
        '<section class="hero">' +
        (c.badge ? '<span class="hero-badge">' + esc(c.badge) + "</span>" : "") +
        "<h1>" + esc(c.name) + " — " + esc(c.tagline) + "</h1>" +
        (has(c.about) ? '<p class="hero-tag">' + esc(c.about[0]) + "</p>" : "") +
        (c.hero ? '<img class="hero-img" src="' + esc(c.hero) + '" alt="' + esc(c.name) + '">' : "") +
        statsRow(c) + "</section>" +
        aboutBlk(c, "GIOI_THIEU", "// Về " + c.name) +
        servicesBlk(c, "DICH_VU", "// Dịch vụ") +
        whyBlk(c, "LY_DO", "// Vì sao chọn") +
        processBlk(c, "QUY_TRINH", "// Quy trình") +
        projectsBlk(c, "DU_AN", "// Công trình") +
        stylesBlk(c, "PHONG_CACH", "// Phong cách") +
        contactBlk(c) + footer(c);
    }
  };

  /* =========================================================
     T9 — SERIF ELEGANCE  (Playfair · trung tính ấm · nhã)
  ========================================================= */
  T.t9 = {
    name: "Serif Elegance", desc: "Trung tính ấm · thanh lịch, tinh tế",
    fonts: ["Montserrat:wght@400;500;600;700;800;900"],
    css: "\
.tpl.t9{--bg:#F5F1EA;--pane:#fff;--tx:#2A2622;--mut:#7a7267;--acc:#9C6B3F;--line:#e4ddd0;font-family:'Montserrat',sans-serif;color:var(--tx);background:var(--bg)}\
.tpl.t9 .site-head{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;padding:16px clamp(20px,4vw,48px);background:#f5f1eae6;backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}\
.tpl.t9 .logo{height:40px}.tpl.t9[data-loginv='1'] .logo{filter:brightness(0)}.tpl.t9 .logo-txt{font-family:'Montserrat',sans-serif;font-size:25px;font-weight:600}\
.tpl.t9 .head-right{display:flex;gap:18px;align-items:center;font-size:13px}.tpl.t9 .back{color:var(--mut)}.tpl.t9 .head-cta{border:1px solid var(--tx);color:var(--tx);padding:9px 20px;border-radius:100px}\
.tpl.t9 .hero{max-width:1000px;margin:0 auto;padding:clamp(56px,9vw,110px) clamp(20px,4vw,48px) clamp(30px,4vw,50px);text-align:center}\
.tpl.t9 .hero-badge{color:var(--acc);letter-spacing:.24em;text-transform:uppercase;font-size:12px;display:block;margin-bottom:24px}\
.tpl.t9 .hero h1{font-family:'Montserrat',sans-serif;font-weight:600;font-size:clamp(38px,6.5vw,76px);line-height:1.08;margin:0 0 20px}\
.tpl.t9 .hero-tag{font-size:clamp(16px,1.7vw,19px);color:var(--mut);max-width:560px;margin:0 auto}\
.tpl.t9 .hero-figure{max-width:1160px;margin:0 auto;padding:0 clamp(20px,4vw,48px)}.tpl.t9 .hero-figure img{width:100%;aspect-ratio:16/8;object-fit:cover}\
.tpl.t9 .hero .stats{display:flex;justify-content:center;flex-wrap:wrap;gap:clamp(28px,5vw,70px);max-width:900px;margin:44px auto 0;padding:34px clamp(20px,4vw,48px) 0;border-top:1px solid var(--line)}\
.tpl.t9 .stat-n{font-family:'Montserrat',sans-serif;font-size:clamp(28px,3.6vw,44px);font-weight:600}.tpl.t9 .stat-l{font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin-top:8px}\
.tpl.t9 .sec{max-width:1160px;margin:0 auto;padding:clamp(54px,8vw,100px) clamp(20px,4vw,48px)}\
.tpl.t9 .sec-head{text-align:center}.tpl.t9 .eyebrow{color:var(--acc);letter-spacing:.2em;text-transform:uppercase;font-size:11.5px;margin-bottom:14px}\
.tpl.t9 .sec-title{font-family:'Montserrat',sans-serif;font-weight:600;font-size:clamp(28px,4vw,50px);margin:0 auto 42px;max-width:640px}\
.tpl.t9 .about-grid{display:grid;grid-template-columns:minmax(240px,400px) 1fr;gap:56px;align-items:center;text-align:left}\
.tpl.t9 .about-media img{width:100%;aspect-ratio:4/5;object-fit:cover}.tpl.t9 .about-p{line-height:1.9;color:#544c43;margin:0 0 18px}\
.tpl.t9 .svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1px;background:var(--line);border:1px solid var(--line);text-align:left}.tpl.t9 .svc{background:var(--pane);padding:34px 28px}.tpl.t9 .svc-num{font-family:'Montserrat',sans-serif;color:var(--acc);font-size:26px;margin-bottom:14px}.tpl.t9 .svc-title{font-family:'Montserrat',sans-serif;font-size:21px;font-weight:600;margin:0 0 10px}.tpl.t9 .svc-desc{font-size:14px;line-height:1.7;color:var(--mut);margin:0}\
.tpl.t9 .why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:34px 40px;text-align:left}.tpl.t9 .why{display:flex;gap:16px}.tpl.t9 .why-num{font-family:'Montserrat',sans-serif;color:var(--acc);font-size:32px}.tpl.t9 .why-title{font-size:16px;margin:0 0 6px}.tpl.t9 .why-desc{font-size:14px;line-height:1.7;color:var(--mut);margin:0}\
.tpl.t9 .sec-process{background:var(--tx);color:#f0e9dd;max-width:none}.tpl.t9 .sec-process>*{max-width:1160px;margin-left:auto;margin-right:auto}.tpl.t9 .sec-process .eyebrow{color:#c99a6a}\
.tpl.t9 .proc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:34px;text-align:left}.tpl.t9 .proc-num{font-family:'Montserrat',sans-serif;color:#c99a6a;font-size:40px;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:12px;margin-bottom:14px}.tpl.t9 .proc-title{font-size:16px;margin:0 0 6px}.tpl.t9 .proc-desc{font-size:13.5px;line-height:1.7;color:rgba(255,255,255,.7);margin:0}\
.tpl.t9 .proj-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;text-align:left}.tpl.t9 .proj-imgwrap{position:relative;aspect-ratio:4/3;overflow:hidden}.tpl.t9 .proj-img{width:100%;height:100%;object-fit:cover;transition:.5s}.tpl.t9 .proj:hover .proj-img{transform:scale(1.04)}.tpl.t9 .proj-badge{position:absolute;top:14px;left:14px;background:var(--bg);color:var(--acc);font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:5px 12px}.tpl.t9 .proj-body{padding:16px 4px}.tpl.t9 .proj-title{font-family:'Montserrat',sans-serif;font-size:21px;font-weight:600;margin:0 0 4px}.tpl.t9 .proj-meta{font-size:13px;color:var(--mut);margin:0}\
.tpl.t9 .style-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:40px;text-align:left}.tpl.t9 .style-num{color:var(--acc);letter-spacing:.16em;font-size:11.5px;margin-bottom:12px}.tpl.t9 .style-name{font-family:'Montserrat',sans-serif;font-size:23px;font-weight:600;margin:0 0 10px}.tpl.t9 .style-desc{font-size:14px;line-height:1.75;color:var(--mut);margin:0}\
.tpl.t9 .contact-wrap{display:grid;grid-template-columns:1fr 1fr;gap:56px;text-align:left}.tpl.t9 .contact-left .sec-head{text-align:left}.tpl.t9 .contact-lead{color:var(--mut);line-height:1.8;margin:0 0 28px}.tpl.t9 .c-label{color:var(--acc);letter-spacing:.12em;font-size:11px;margin-bottom:4px}.tpl.t9 .c-item{margin-bottom:18px}.tpl.t9 .c-phone a{font-family:'Montserrat',sans-serif;font-size:22px}\
.tpl.t9 .c-social{display:flex;gap:18px;margin-top:22px;color:var(--acc);font-size:13.5px}\
.tpl.t9 .contact-form{background:var(--pane);border:1px solid var(--line);padding:34px;display:flex;flex-direction:column;gap:14px}.tpl.t9 .contact-form h3{font-family:'Montserrat',sans-serif;font-size:24px;font-weight:600;margin:0 0 6px}.tpl.t9 .contact-form input,.tpl.t9 .contact-form textarea{border:1px solid var(--line);padding:13px 15px;font-family:inherit;font-size:14px;background:var(--bg)}.tpl.t9 .contact-form button{background:var(--tx);color:#f0e9dd;border:0;padding:15px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;font-size:12px;cursor:pointer;font-family:inherit}.tpl.t9 .ok{color:#2E7D32;font-size:13px}\
.tpl.t9 .site-foot{border-top:1px solid var(--line);padding:32px clamp(20px,4vw,48px);display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;font-size:13px;color:var(--mut)}.tpl.t9 .foot-links a{color:var(--acc)}\
@media(max-width:820px){.tpl.t9 .about-grid,.tpl.t9 .contact-wrap{grid-template-columns:1fr}.tpl.t9 .about-media{display:none}}",
    render: function (c) {
      return header(c, "Đặt lịch tư vấn") +
        '<section class="hero">' +
        (c.badge ? '<span class="hero-badge">' + esc(c.badge) + "</span>" : "") +
        "<h1>" + esc(c.name) + "</h1>" +
        '<p class="hero-tag">' + esc(c.tagline) + "</p></section>" +
        (c.hero ? '<div class="hero-figure"><img src="' + esc(c.hero) + '" alt="' + esc(c.name) + '"></div>' : "") +
        (has(c.stats) ? '<section class="hero" style="padding-top:0">' + statsRow(c) + "</section>" : "") +
        aboutBlk(c, "GIỚI THIỆU", "Về " + c.name) +
        servicesBlk(c, "DỊCH VỤ", "Dịch vụ của chúng tôi") +
        whyBlk(c, "GIÁ TRỊ", "Cam kết bền vững") +
        processBlk(c, "QUY TRÌNH", "Quy trình chuẩn mực") +
        projectsBlk(c, "TÁC PHẨM", "Công trình tiêu biểu") +
        stylesBlk(c, "PHONG CÁCH", "Ngôn ngữ thiết kế") +
        contactBlk(c) + footer(c);
    }
  };

  /* =========================================================
     T10 — VIVID POP  (tím/lime/hồng · rực rỡ · Space Grotesk)
  ========================================================= */
  T.t10 = {
    name: "Vivid Pop", desc: "Tím · Lime · Rực rỡ — năng động, cá tính",
    fonts: ["Montserrat:wght@400;500;600;700;800;900"],
    css: "\
.tpl.t10{--pur:#6C2BD9;--lime:#C6F135;--pink:#FF4FA3;--dark:#160B2E;--tx:#160B2E;--mut:#6b6480;--line:#e7e0f5;font-family:'Montserrat',sans-serif;color:var(--tx);background:#fff}\
.tpl.t10 .site-head{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;padding:14px clamp(20px,4vw,48px);background:#fffffff2;backdrop-filter:blur(8px);border-bottom:2px solid var(--dark)}\
.tpl.t10 .logo{height:38px}.tpl.t10[data-loginv='1'] .logo{filter:brightness(0)}.tpl.t10 .logo-txt{font-weight:700;font-size:22px;color:var(--pur)}\
.tpl.t10 .head-right{display:flex;gap:16px;align-items:center;font-size:13px;font-weight:500}.tpl.t10 .back{color:var(--mut)}.tpl.t10 .head-cta{background:var(--lime);color:var(--dark);padding:9px 18px;border-radius:100px;font-weight:700;border:2px solid var(--dark)}\
.tpl.t10 .hero{position:relative;background:var(--pur);color:#fff;overflow:hidden}\
.tpl.t10 .hero::before{content:'';position:absolute;width:340px;height:340px;background:var(--pink);border-radius:50%;top:-120px;right:-80px;opacity:.6;filter:blur(10px)}\
.tpl.t10 .hero::after{content:'';position:absolute;width:200px;height:200px;background:var(--lime);border-radius:50%;bottom:-80px;left:10%;opacity:.5}\
.tpl.t10 .hero-inner{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:clamp(50px,8vw,96px) clamp(20px,4vw,48px)}\
.tpl.t10 .hero-badge{display:inline-block;background:var(--lime);color:var(--dark);font-weight:700;padding:7px 16px;border-radius:100px;font-size:12.5px;margin-bottom:22px;border:2px solid var(--dark)}\
.tpl.t10 .hero h1{font-size:clamp(36px,6.4vw,74px);font-weight:700;line-height:1.02;letter-spacing:-.03em;margin:0 0 18px;max-width:840px}\
.tpl.t10 .hero-tag{font-size:clamp(16px,1.7vw,20px);color:rgba(255,255,255,.9);max-width:560px;margin:0 0 32px}\
.tpl.t10 .hero-img{width:100%;aspect-ratio:16/7;object-fit:cover;border-radius:20px;border:3px solid var(--dark);box-shadow:12px 12px 0 var(--lime)}\
.tpl.t10 .hero .stats{display:flex;flex-wrap:wrap;gap:clamp(22px,4vw,52px);margin-top:40px}\
.tpl.t10 .stat-n{font-size:clamp(26px,3.4vw,42px);font-weight:700;color:var(--lime)}.tpl.t10 .stat-l{font-size:12.5px;color:rgba(255,255,255,.85);margin-top:4px}\
.tpl.t10 .sec{max-width:1160px;margin:0 auto;padding:clamp(50px,8vw,92px) clamp(20px,4vw,48px)}\
.tpl.t10 .eyebrow{display:inline-block;background:var(--dark);color:var(--lime);font-weight:700;letter-spacing:.04em;font-size:12px;padding:5px 12px;border-radius:100px;margin-bottom:14px}\
.tpl.t10 .sec-title{font-size:clamp(26px,4vw,48px);font-weight:700;letter-spacing:-.02em;margin:0 0 38px;max-width:720px}\
.tpl.t10 .about-grid{display:grid;grid-template-columns:minmax(240px,400px) 1fr;gap:48px;align-items:center}.tpl.t10 .about-media img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:20px;border:3px solid var(--dark);box-shadow:10px 10px 0 var(--pink)}.tpl.t10 .about-p{color:#4a4360;line-height:1.8;margin:0 0 16px}\
.tpl.t10 .svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px}.tpl.t10 .svc{background:#fff;border:2px solid var(--dark);border-radius:18px;padding:28px 24px;box-shadow:6px 6px 0 var(--pur);transition:.15s}.tpl.t10 .svc:hover{transform:translate(-2px,-2px);box-shadow:8px 8px 0 var(--pur)}.tpl.t10 .svc-num{width:42px;height:42px;border-radius:12px;background:var(--lime);border:2px solid var(--dark);color:var(--dark);font-weight:700;display:flex;align-items:center;justify-content:center;margin-bottom:16px}.tpl.t10 .svc-title{font-size:17px;font-weight:700;margin:0 0 8px}.tpl.t10 .svc-desc{font-size:14px;line-height:1.6;color:var(--mut);margin:0}\
.tpl.t10 .sec-why{background:var(--dark);color:#fff;max-width:none;border-radius:0}.tpl.t10 .sec-why>*{max-width:1160px;margin-left:auto;margin-right:auto}.tpl.t10 .sec-why .eyebrow{background:var(--lime);color:var(--dark)}\
.tpl.t10 .why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px}.tpl.t10 .why{background:rgba(255,255,255,.06);border-radius:16px;padding:24px;display:flex;gap:14px}.tpl.t10 .why-num{color:var(--lime);font-weight:700;font-size:26px}.tpl.t10 .why-title{font-size:16px;margin:0 0 6px}.tpl.t10 .why-desc{font-size:13.5px;line-height:1.6;color:rgba(255,255,255,.75);margin:0}\
.tpl.t10 .proc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:22px}.tpl.t10 .proc{border:2px solid var(--dark);border-radius:16px;padding:24px}.tpl.t10 .proc-num{font-size:30px;font-weight:700;color:var(--pur);margin-bottom:8px}.tpl.t10 .proc-title{font-size:16px;margin:0 0 6px}.tpl.t10 .proc-desc{font-size:13.5px;line-height:1.6;color:var(--mut);margin:0}\
.tpl.t10 .proj-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:24px}.tpl.t10 .proj{border:2px solid var(--dark);border-radius:18px;overflow:hidden;box-shadow:6px 6px 0 var(--pink)}.tpl.t10 .proj-imgwrap{position:relative;aspect-ratio:4/3;border-bottom:2px solid var(--dark)}.tpl.t10 .proj-img{width:100%;height:100%;object-fit:cover}.tpl.t10 .proj-badge{position:absolute;top:12px;left:12px;background:var(--lime);color:var(--dark);font-size:11px;font-weight:700;padding:5px 12px;border-radius:100px;border:2px solid var(--dark)}.tpl.t10 .proj-body{padding:18px 20px}.tpl.t10 .proj-title{font-size:16px;font-weight:700;margin:0 0 5px}.tpl.t10 .proj-meta{font-size:13px;color:var(--mut);margin:0}\
.tpl.t10 .style-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}.tpl.t10 .style{border:2px solid var(--dark);border-radius:18px;padding:26px;box-shadow:6px 6px 0 var(--lime)}.tpl.t10 .style-num{font-weight:700;color:var(--pur);margin-bottom:8px}.tpl.t10 .style-name{font-size:18px;font-weight:700;margin:0 0 8px}.tpl.t10 .style-desc{font-size:14px;line-height:1.65;color:var(--mut);margin:0}\
.tpl.t10 .sec-contact{max-width:none;background:var(--lime)}.tpl.t10 .contact-wrap{max-width:1160px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px}.tpl.t10 .sec-contact .eyebrow{background:var(--dark);color:var(--lime)}\
.tpl.t10 .contact-lead{color:#3a3350;line-height:1.7;margin:0 0 24px}.tpl.t10 .c-label{color:var(--pur);font-weight:700;font-size:11.5px;letter-spacing:.04em;margin-bottom:3px}.tpl.t10 .c-item{margin-bottom:16px}.tpl.t10 .c-phone a{font-size:19px;font-weight:700}\
.tpl.t10 .c-social{display:flex;gap:16px;margin-top:20px;color:var(--pur);font-weight:600;font-size:13.5px}\
.tpl.t10 .contact-form{background:#fff;border:2px solid var(--dark);border-radius:20px;padding:30px;display:flex;flex-direction:column;gap:12px;box-shadow:8px 8px 0 var(--dark)}.tpl.t10 .contact-form h3{font-size:20px;font-weight:700;margin:0 0 6px}.tpl.t10 .contact-form input,.tpl.t10 .contact-form textarea{border:2px solid var(--dark);border-radius:10px;padding:12px 14px;font-family:inherit;font-size:14px}.tpl.t10 .contact-form button{background:var(--pur);color:#fff;border:2px solid var(--dark);padding:14px;border-radius:100px;font-weight:700;cursor:pointer;font-family:inherit}.tpl.t10 .ok{color:#1a7a2e;font-size:13px}\
.tpl.t10 .site-foot{background:var(--dark);color:rgba(255,255,255,.7);padding:30px clamp(20px,4vw,48px);display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;font-size:13px}.tpl.t10 .foot-links a{color:var(--lime)}\
@media(max-width:820px){.tpl.t10 .about-grid,.tpl.t10 .contact-wrap{grid-template-columns:1fr}.tpl.t10 .about-media{display:none}}",
    render: function (c) {
      return header(c, "Chat ngay") +
        '<section class="hero"><div class="hero-inner">' +
        (c.badge ? '<span class="hero-badge">' + esc(c.badge) + "</span>" : "") +
        "<h1>" + esc(c.name) + " — " + esc(c.tagline) + "</h1>" +
        (has(c.about) ? '<p class="hero-tag">' + esc(c.about[0]) + "</p>" : "") +
        (c.hero ? '<img class="hero-img" src="' + esc(c.hero) + '" alt="' + esc(c.name) + '">' : "") +
        statsRow(c) + "</div></section>" +
        aboutBlk(c, "GIỚI THIỆU", "Về " + c.name) +
        servicesBlk(c, "DỊCH VỤ", "Bạn cần gì, có ngay") +
        whyBlk(c, "LÝ DO", "Vì sao chọn " + c.name) +
        processBlk(c, "QUY TRÌNH", "4 bước gọn gàng") +
        projectsBlk(c, "DỰ ÁN", "Công trình chất") +
        stylesBlk(c, "PHONG CÁCH", "Phong cách thiết kế") +
        contactBlk(c) + footer(c);
    }
  };

  window.TEMPLATES = T;
  window.TEMPLATE_LIST = Object.keys(T).map(function (k) { return { id: k, name: T[k].name, desc: T[k].desc }; });
  window.renderTemplate = function (id, c) {
    var t = T[id] || T.t1;
    return { html: t.render(c), css: t.css, fonts: t.fonts, root: id };
  };
})();
