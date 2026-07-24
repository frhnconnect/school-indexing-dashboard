/* print-charts.js — resize Chart.js before/after print for portrait */

(function () {
  function allCharts() {
    if (typeof Chart === 'undefined' || !Chart.instances) return [];
    // Chart v3+: Chart.instances is object; v4 Map-like
    var list = [];
    var inst = Chart.instances;
    if (inst && typeof inst.forEach === 'function') {
      inst.forEach(function (c) { list.push(c); });
    } else if (inst) {
      Object.keys(inst).forEach(function (k) { if (inst[k]) list.push(inst[k]); });
    }
    return list;
  }

  function resizeAll() {
    allCharts().forEach(function (c) {
      try { c.resize(); } catch (e) {}
    });
  }

  window.addEventListener('beforeprint', function () {
    // give CSS a tick then resize into print box
    setTimeout(resizeAll, 50);
  });
  window.addEventListener('afterprint', function () {
    setTimeout(resizeAll, 50);
  });

  // Safari sometimes misses beforeprint — wrap window.print
  var _print = window.print.bind(window);
  window.print = function () {
    document.documentElement.classList.add('printing');
    resizeAll();
    setTimeout(function () {
      _print();
      setTimeout(function () {
        document.documentElement.classList.remove('printing');
        resizeAll();
      }, 300);
    }, 80);
  };
})();
