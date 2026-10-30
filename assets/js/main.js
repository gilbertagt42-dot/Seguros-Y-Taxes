/* ==========================================================================
   Alex Seguros & Taxes — interacciones del sitio
   Todo el contenido editable (teléfonos, correos, horarios) vive en
   assets/js/site-config.js
   ========================================================================== */
(function () {
  "use strict";

  var SITE = window.SITE || {};

  /* ------------------------------ utilidades ----------------------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function get(path) {
    return path.split(".").reduce(function (acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : undefined;
    }, SITE);
  }

  var money = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0
  });

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* --------------------- 1. inyección de datos de contacto ---------------- */
  function fillData() {
    $$("[data-site]").forEach(function (el) {
      var val = get(el.getAttribute("data-site"));
      if (val) el.textContent = val;
    });

    $$("[data-link]").forEach(function (el) {
      var parts = el.getAttribute("data-link").split(".");
      var kind = parts.pop();
      var data = get(parts.join("."));
      if (!data) return;

      var href = "#";
      if (kind === "tel") href = "tel:+" + data.phoneIntl;
      if (kind === "mail") href = "mailto:" + data.email;
      if (kind === "wa") {
        var text = el.getAttribute("data-wa-text") || "";
        href = "https://wa.me/" + data.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");
      }
      if (kind === "map") href = data.mapUrl || "#";
      if (kind === "booking") href = data.booking || "contacto.html";

      el.setAttribute("href", href);
      if (kind === "wa") { el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener"); }
    });

    $$("[data-site-html]").forEach(function (el) {
      var val = get(el.getAttribute("data-site-html"));
      if (val) el.innerHTML = val;
    });

    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    $$("[data-city]").forEach(function (el) { el.textContent = get("site.city") || ""; });
  }

  /* ---------- 2. mejora automática de logotipos (PNG si existe) ----------- */
  function upgradeLogos() {
    $$("img[data-logo-png]").forEach(function (img) {
      var candidate = img.getAttribute("data-logo-png");
      if (!candidate) return;
      var probe = new Image();
      probe.onload = function () {
        if (probe.naturalWidth > 4) {
          img.src = candidate;
          img.classList.add("is-real");
        }
      };
      probe.src = candidate;
    });
  }

  /* -------------------------- 3. navegación ------------------------------- */
  function initNav() {
    var burger = $("#burger");
    var nav = $("#nav");
    var scrim = $("#scrim");
    if (!burger || !nav) return;

    function close() {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      if (scrim) scrim.classList.remove("is-on");
      document.body.style.overflow = "";
    }

    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      if (scrim) scrim.classList.toggle("is-on", open);
      document.body.style.overflow = open ? "hidden" : "";
    });

    if (scrim) scrim.addEventListener("click", close);
    $$(".nav a").forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 920) close();
    });
  }

  function initHeader() {
    var header = $(".header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var page = document.body.getAttribute("data-page");
    if (page) {
      var current = document.querySelector('.nav a[data-nav="' + page + '"]');
      if (current) current.setAttribute("aria-current", "page");
    }
  }

  /* --------------------- 4. revelado al hacer scroll ---------------------- */
  function initReveal() {
    var items = $$("[data-reveal]");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------- 5. acordeón ------------------------------- */
  function initAccordions() {
    $$(".acc").forEach(function (acc) {
      var btn = $(".acc__btn", acc);
      var panel = $(".acc__panel", acc);
      if (!btn || !panel) return;

      btn.addEventListener("click", function () {
        var open = acc.classList.contains("is-open");
        var group = acc.parentElement;

        if (group && group.hasAttribute("data-accordion-single")) {
          $$(".acc.is-open", group).forEach(function (other) {
            if (other === acc) return;
            other.classList.remove("is-open");
            var ob = $(".acc__btn", other);
            var op = $(".acc__panel", other);
            if (ob) ob.setAttribute("aria-expanded", "false");
            if (op) op.style.maxHeight = "0px";
          });
        }

        acc.classList.toggle("is-open", !open);
        btn.setAttribute("aria-expanded", String(!open));
        panel.style.maxHeight = !open ? panel.scrollHeight + 40 + "px" : "0px";
      });
    });
  }

  /* ------------------- 6. formulario de contacto -------------------------- */
  function initForm() {
    var form = $("#contact-form");
    if (!form) return;
    var status = $("#form-status", form) || $("#form-status");

    function show(type, msg) {
      if (!status) return;
      status.className = "form__status is-" + type;
      status.textContent = msg;
      status.setAttribute("role", "alert");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.elements.namedItem("nombre");
      var email = form.elements.namedItem("email");
      var service = form.elements.namedItem("servicio");
      var msg = form.elements.namedItem("mensaje");
      var consent = form.elements.namedItem("consent");

      if (!name.value.trim() || !email.value.trim() || !msg.value.trim()) {
        show("err", "Completa tu nombre, correo y mensaje para poder ayudarte.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        show("err", "Revisa tu correo electrónico: parece incompleto.");
        return;
      }
      if (consent && !consent.checked) {
        show("err", "Necesitamos tu autorización para contactarte.");
        return;
      }

      var target = service && service.value === "taxes" ? SITE.taxes : SITE.insurance;
      var subject = "Consulta desde el sitio web · " + (service ? service.options[service.selectedIndex].text : "General");
      var body = [
        "Nombre: " + name.value.trim(),
        "Correo: " + email.value.trim(),
        "Teléfono: " + (form.elements.namedItem("telefono") || {}).value || "",
        "Servicio de interés: " + (service ? service.options[service.selectedIndex].text : ""),
        "",
        msg.value.trim()
      ].join("\n");

      var endpoint = form.getAttribute("data-endpoint");
      if (endpoint) {
        var data = new FormData(form);
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) { if (!r.ok) throw new Error("bad"); return r; })
          .then(function () {
            form.reset();
            show("ok", "¡Mensaje enviado! Te responderemos en menos de 24 horas hábiles.");
          })
          .catch(function () {
            show("err", "No pudimos enviar el formulario. Escríbenos a " + target.email + " o por WhatsApp.");
          });
        return;
      }

      window.location.href = "mailto:" + target.email +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      var wa = $("#form-wa");
      if (wa) {
        wa.href = "https://wa.me/" + target.whatsapp + "?text=" + encodeURIComponent(body);
        wa.hidden = false;
      }
      show("ok", "Se abrió tu aplicación de correo con el mensaje listo. Si no ocurrió, usa el botón de WhatsApp.");
    });
  }

  /* ---------------------- 7. asesoría personalizada ----------------------- */
  var WIZARD_DATA = {
    vida: {
      title: "Protección para tu familia",
      items: [
        ["Seguro de vida a término", "La forma más económica de proteger el ingreso familiar durante los años de mayor responsabilidad."],
        ["Revisión de beneficiarios", "Verificamos que tu póliza actual y tus cuentas de retiro tengan los beneficiarios correctos."]
      ],
      url: "vida.html"
    },
    salud: {
      title: "Cobertura de salud a tu medida",
      items: [
        ["Plan del Marketplace (ACA)", "Comparamos planes, subsidios y deducibles según tu ingreso y tu familia."],
        ["Medicare y suplementos", "Si tienes 65 años o más, revisamos Medicare Advantage, suplementos y medicamentos."]
      ],
      url: "salud.html"
    },
    anualidades: {
      title: "Ingreso para tu retiro",
      items: [
        ["Anualidad indexada", "Crecimiento ligado a un índice, con protección contra pérdidas por caídas del mercado."],
        ["Estrategia de ingreso", "Convertimos tus ahorros en un ingreso mensual predecible para toda la vida."]
      ],
      url: "anualidades.html"
    },
    taxes: {
      title: "Impuestos personales en orden",
      items: [
        ["Declaración 1040 completa", "Créditos, deducciones y dependientes revisados uno por uno."],
        ["ITIN y contribuyentes nuevos", "Declaramos sin número de Seguro Social y te ayudamos a obtener tu ITIN."]
      ],
      url: "taxes.html"
    },
    varios: {
      title: "Plan integral: protección + retiro + impuestos",
      items: [
        ["Diagnóstico financiero", "Revisamos protección, ahorro para el retiro y situación fiscal en una sola conversación."],
        ["Plan por etapas", "Priorizamos lo urgente y armamos un calendario claro para el resto del año."]
      ],
      url: "contacto.html"
    }
  };

  var EXTRA = {
    familia: "Incluiremos una estimación de cobertura por hijos y educación.",
    pareja: "Revisaremos protección mutua y beneficiarios.",
    solo: "Enfocaremos la conversación en tu independencia financiera.",
    retiro: "Sumaremos una proyección de ingreso para el retiro.",
    negocio: "Añadiremos la parte de impuestos de trabajo independiente (1099)."
  };

  function initWizard() {
    var wizard = $("#wizard");
    if (!wizard) return;

    var panels = $$(".wizard__panel", wizard);
    var bar = $(".wizard__bar i", wizard);
    var current = 0;
    var answers = {};
    var labels = { 1: "necesidad", 2: "situación", 3: "preferencia" };

    function show(index) {
      current = index;
      panels.forEach(function (p, i) { p.classList.toggle("is-active", i === index); });
      if (bar) bar.style.width = ((index + 1) / panels.length) * 100 + "%";
    }

    $$(".opt", wizard).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = btn.closest(".wizard__panel");
        $$(".opt", panel).forEach(function (o) { o.classList.remove("is-picked"); });
        btn.classList.add("is-picked");

        var key = btn.getAttribute("data-q");
        answers[key] = btn.getAttribute("data-value");
        answers[key + "Label"] = btn.getAttribute("data-label") || btn.textContent.trim();

        if (panel.getAttribute("data-panel") === "3") {
          renderResult();
        } else {
          show(current + 1);
        }
      });
    });

    $$(".wizard__back", wizard).forEach(function (btn) {
      btn.addEventListener("click", function () { show(Math.max(0, current - 1)); });
    });

    function renderResult() {
      var data = WIZARD_DATA[answers.necesidad] || WIZARD_DATA.varios;
      var extra = EXTRA[answers.situacion] || "";
      var contact = answers.necesidad === "taxes" ? SITE.taxes : SITE.insurance;

      var html = '<span class="rec__tag">Recomendación para ti</span>' +
        '<h4 style="margin-top:6px">' + esc(data.title) + "</h4>" +
        '<p style="margin-bottom:12px">' + esc(extra || "Adaptaremos la propuesta a lo que necesitas.") + "</p>";

      data.items.forEach(function (item) {
        html += '<div class="rec"><h4>' + esc(item[0]) + "</h4><p>" + esc(item[1]) + "</p></div>";
      });

      var msg = "Hola, " + (contact.owner || "") + ". Usé el asistente del sitio. " +
        "Me interesa: " + (answers.necesidadLabel || "") + ". " +
        "Mi situación: " + (answers.situacionLabel || "") + ". " +
        "Prefiero: " + (answers.preferenciaLabel || "") + ".";

      html += '<div class="btn-row" style="margin-top:8px">' +
        '<a class="btn btn--gold btn--sm" target="_blank" rel="noopener" href="https://wa.me/' +
        contact.whatsapp + "?text=" + encodeURIComponent(msg) + '">Enviar por WhatsApp</a>' +
        '<a class="btn btn--ghost btn--sm" href="' + data.url + '">Leer más</a>' +
        "</div>";

      var box = $(".wizard__result", wizard);
      if (box) {
        box.innerHTML = html;
        show(panels.length - 1);
        var resultPanel = box.closest(".wizard__panel");
        if (resultPanel) resultPanel.classList.add("is-active");
      }
    }
  }

  /* ------------------------------ arranque -------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    fillData();
    upgradeLogos();
    initHeader();
    initNav();
    initReveal();
    initAccordions();
    initForm();
    initWizard();
    if (window.SiteTools) window.SiteTools.init();
  });
})();
