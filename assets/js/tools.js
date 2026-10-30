/* ==========================================================================
   Herramientas interactivas: calculadoras y listas de verificación
   Se activan solo si el elemento existe en la página.
   ========================================================================== */
window.SiteTools = (function () {
  "use strict";

  var money = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0
  });
  var money2 = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0
  });

  function val(id, fallback) {
    var el = document.getElementById(id);
    if (!el) return fallback || 0;
    var n = parseFloat(String(el.value).replace(/[^0-9.\-]/g, ""));
    return isNaN(n) ? (fallback || 0) : n;
  }

  function paintRange(el) {
    var min = parseFloat(el.min || 0);
    var max = parseFloat(el.max || 100);
    var pct = ((parseFloat(el.value) - min) / (max - min)) * 100;
    el.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
  }

  /* ------------------- Calculadora de seguro de vida ---------------------- */
  function life() {
    var root = document.getElementById("tool-life");
    if (!root) return;

    var out = document.getElementById("lifeTotal");
    var hint = document.getElementById("lifeHint");
    var rows = document.getElementById("lifeRows");
    var yearsOut = document.getElementById("lifeYearsOut");

    function update() {
      var income = val("lifeIncome", 60000);
      var years = val("lifeYears", 10);
      var debt = val("lifeDebt", 0);
      var edu = val("lifeEdu", 0);
      var savings = val("lifeSavings", 0);

      var incomeReplace = income * years;
      var need = Math.max(0, incomeReplace + debt + edu - savings);

      if (out) out.textContent = money.format(need);
      if (yearsOut) yearsOut.textContent = years + " años";
      var incomeOut = document.getElementById("lifeIncomeOut");
      if (incomeOut) incomeOut.textContent = money.format(income);
      if (hint) {
        hint.textContent = income > 0
          ? "Equivale a " + (need / income).toFixed(1) + " veces tu ingreso anual."
          : "Ajusta tu ingreso anual para ver la estimación.";
      }
      if (rows) {
        rows.innerHTML =
          row("Reemplazo de ingreso (" + years + " años)", money.format(incomeReplace)) +
          row("Deudas pendientes", money.format(debt)) +
          row("Educación / gastos finales", money.format(edu)) +
          row("Ahorros y cobertura actual", "− " + money.format(savings));
      }
    }

    function row(label, value) {
      return '<div class="result__row"><span>' + label + "</span><b>" + value + "</b></div>";
    }

    root.querySelectorAll("input").forEach(function (input) {
      input.addEventListener("input", function () {
        if (input.type === "range") paintRange(input);
        update();
      });
    });

    root.querySelectorAll('input[type="range"]').forEach(paintRange);
    update();
  }

  /* --------------------- Estimador de anualidades ------------------------- */
  function annuity() {
    var root = document.getElementById("tool-annuity");
    if (!root) return;

    var out = document.getElementById("annMonthly");
    var annualOut = document.getElementById("annYearly");
    var rateOut = document.getElementById("annRateOut");
    var capOut = document.getElementById("annCapOut");

    function update() {
      var capital = val("annCapital", 100000);
      var rate = val("annRate", 5);

      var yearly = capital * (rate / 100);
      var monthly = yearly / 12;

      if (out) out.textContent = money.format(monthly);
      if (annualOut) annualOut.textContent = money.format(yearly);
      if (rateOut) rateOut.textContent = rate.toFixed(2).replace(/\.00$/, "") + "%";
      if (capOut) capOut.textContent = money.format(capital);

      var capRow = document.getElementById("annCapRow");
      var rateRow = document.getElementById("annRateRow");
      if (capRow) capRow.textContent = money.format(capital);
      if (rateRow) rateRow.textContent = rate.toFixed(2).replace(/\.00$/, "") + "%";
    }

    root.querySelectorAll("input").forEach(function (input) {
      input.addEventListener("input", function () {
        if (input.type === "range") paintRange(input);
        update();
      });
    });

    root.querySelectorAll('input[type="range"]').forEach(paintRange);
    update();
  }

  /* ------------------- Generador de documentos para taxes ----------------- */
  function docgen() {
    var root = document.getElementById("docgen");
    if (!root) return;

    var list = document.getElementById("docList");
    var empty = document.getElementById("docEmpty");
    var count = document.getElementById("docCount");
    var printBtn = document.getElementById("docPrint");
    var clearBtn = document.getElementById("docClear");
    var copies = document.getElementById("docCopies");

    function render() {
      var checked = root.querySelectorAll('input[type="checkbox"]:checked');
      if (list) list.innerHTML = "";
      if (count) count.textContent = checked.length + " seleccionado" + (checked.length === 1 ? "" : "s");
      if (empty) empty.hidden = checked.length > 0;
      if (copies) copies.hidden = checked.length === 0;

      checked.forEach(function (input, i) {
        var label = input.closest("label");
        var title = label.querySelector("span").childNodes[0].textContent.trim();
        var note = label.querySelector("small");
        var li = document.createElement("li");
        li.className = "checklist__item";
        li.innerHTML =
          '<span style="font-weight:600;color:var(--ink)">' + (i + 1) + ". " + title +
          (note ? "<small>" + note.textContent + "</small>" : "") + "</span>";
        if (list) list.appendChild(li);
      });
    }

    root.addEventListener("change", render);
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
    if (clearBtn) clearBtn.addEventListener("click", function () {
      root.querySelectorAll('input[type="checkbox"]').forEach(function (i) { i.checked = false; });
      render();
    });

    render();
  }

  /* -------------- Lista de verificación de salud (persistente) ------------ */
  function healthCheck() {
    var root = document.getElementById("hcheck");
    if (!root) return;

    var KEY = "alex-health-checklist";
    var boxes = root.querySelectorAll('input[type="checkbox"]');
    var bar = document.getElementById("hBar");
    var label = document.getElementById("hCount");
    var saved = {};

    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { saved = {}; }

    boxes.forEach(function (box, i) {
      if (saved[i]) box.checked = true;
    });

    function update() {
      var done = 0;
      var store = {};
      boxes.forEach(function (box, i) {
        if (box.checked) { done++; store[i] = 1; }
      });
      if (bar) bar.style.width = (done / boxes.length) * 100 + "%";
      if (label) label.textContent = done + " de " + boxes.length + " listos";
      try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
    }

    root.addEventListener("change", update);
    update();
  }

  function init() {
    life();
    annuity();
    docgen();
    healthCheck();
  }

  return { init: init };
})();
