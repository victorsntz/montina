/* Landing da cartilha: interações. Tudo é enfeite: sem JavaScript a página funciona inteira. */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("lp-js");
  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mouseFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ---- compartilhar no WhatsApp com o endereço desta página ---- */
  var zap = $("#lp-whatsapp");
  if (zap && /^https?:/.test(location.protocol)) {
    var texto = "Manual para o paciente com lúpus do DF, cartilha gratuita da Dra. Paula Cristina Montina: " + location.href.split("#")[0];
    zap.href = "https://wa.me/?text=" + encodeURIComponent(texto);
  }

  /* ---- livreto: abre e fecha com clique ou toque ---- */
  var mock = $(".lp-mock"), book = $(".lp-book"), btn = $(".lp-book__inner");
  if (btn) btn.addEventListener("click", function () {
    var aberto = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", aberto ? "true" : "false");
    btn.setAttribute("aria-label", aberto ? "Fechar a cartilha" : "Abrir a cartilha e ver a primeira página");
    book.classList.toggle("is-open", aberto);
    mock.classList.toggle("is-open", aberto);
  });

  /* ---- entrada suave ao rolar ---- */
  var revelar = $$("[data-reveal], [data-reveal-group]");
  $$("[data-reveal-group]").forEach(function (g) { $$(":scope > *", g).forEach(function (el, i) { el.style.setProperty("--d", (i * 0.06).toFixed(2) + "s"); }); });
  if ("IntersectionObserver" in window && !calmo) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px 15% 0px", threshold: 0 });
    revelar.forEach(function (el) { io.observe(el); });
  } else revelar.forEach(function (el) { el.classList.add("is-in"); });

  /* ---- páginas duplas: ampliar ---- */
  var box = $(".lp-lightbox");
  if (box && typeof box.showModal === "function") {
    var img = $("img", box);
    $$("[data-lightbox] img").forEach(function (im) {
      im.setAttribute("tabindex", "0"); im.setAttribute("role", "button");
      var abrir = function () { img.src = im.currentSrc || im.src; img.alt = im.alt; box.showModal(); };
      im.addEventListener("click", abrir);
      im.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); } });
    });
    $(".lp-lightbox__close").addEventListener("click", function () { box.close(); });
    box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
  }

  if (calmo) return; /* daqui para baixo, só movimento */

  /* ---- topo: livreto inclina com o mouse, reflexo corre na capa, sol e luz acompanham ---- */
  var hero = $(".lp-hero"), sun = $(".lp-hero__sun"), glare = $(".lp-book__glare");
  var alvo = { x: 0, y: 0 }, atual = { x: 0, y: 0 };
  if (hero && mouseFino) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      alvo.x = (e.clientX - r.left) / r.width * 2 - 1;
      alvo.y = (e.clientY - r.top) / r.height * 2 - 1;
      hero.style.setProperty("--hx", (e.clientX - r.left) + "px");
      hero.style.setProperty("--hy", (e.clientY - r.top) + "px");
    });
    hero.addEventListener("pointerleave", function () { alvo.x = 0; alvo.y = 0; });
  }

  var visivel = true;
  if ("IntersectionObserver" in window && hero) new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; }).observe(hero);


  function quadro() {
    if (visivel && !document.hidden) {
      /* livreto e sol */
      atual.x += (alvo.x - atual.x) * 0.08; atual.y += (alvo.y - atual.y) * 0.08;
      if (btn && !book.classList.contains("is-open")) {
        btn.style.setProperty("--ry", (-26 + atual.x * 14).toFixed(2) + "deg");
        btn.style.setProperty("--rx", (5 - atual.y * 8).toFixed(2) + "deg");
      } else if (btn) { btn.style.setProperty("--ry", "-10deg"); btn.style.setProperty("--rx", "3deg"); }
      if (glare) { glare.style.setProperty("--gx", (40 + atual.x * 45).toFixed(1) + "%"); glare.style.setProperty("--gy", (30 + atual.y * 40).toFixed(1) + "%"); }
      if (sun) sun.style.transform = "translate(" + (-atual.x * 18).toFixed(1) + "px," + (-atual.y * 14).toFixed(1) + "px)";
    }
    requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);

  /* ---- "Por que a borboleta?": a borboleta grande bate as asas com o mouse no bloco (ou com um toque) ---- */
  var bloco = $("[data-asas]");
  if (bloco) {
    var asa = $(".lp-asa", bloco), arte = $(".lp-why__art", bloco), pousar = false, timer;
    var bater = function () { pousar = false; bloco.classList.add("is-batendo"); };
    var parar = function () { pousar = true; };
    /* termina a batida que está no meio antes de pousar, sem tranco */
    if (asa) asa.addEventListener("animationiteration", function () { if (pousar) { bloco.classList.remove("is-batendo"); pousar = false; } });
    if (mouseFino) { bloco.addEventListener("pointerenter", bater); bloco.addEventListener("pointerleave", parar); }
    if (arte) arte.addEventListener("click", function () { bater(); clearTimeout(timer); if (!mouseFino) timer = setTimeout(parar, 2600); });
  }

  if (!mouseFino) return; /* daqui para baixo, só com mouse */

  /* ---- cartões dos capítulos: inclinação 3D e brilho ---- */
  $$(".lp-chapters li").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.setProperty("--mx", (px * 100).toFixed(1) + "%"); c.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      c.style.setProperty("--tx", ((0.5 - py) * 9).toFixed(2) + "deg"); c.style.setProperty("--ty", ((px - 0.5) * 11).toFixed(2) + "deg");
    });
    c.addEventListener("pointerleave", function () { c.style.setProperty("--tx", "0deg"); c.style.setProperty("--ty", "0deg"); });
  });

  /* ---- botões magnéticos ---- */
  $$(".lp-btn").forEach(function (b) {
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      b.style.transform = "translate(" + (x * 0.16).toFixed(1) + "px," + (y * 0.28).toFixed(1) + "px)";
    });
    b.addEventListener("pointerleave", function () { b.style.transform = ""; });
  });
})();
