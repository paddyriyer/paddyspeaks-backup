// Soundarya Lahari - Interactive Application
// ============================================

(function () {
  'use strict';

  var slokas = SOUNDARYA_LAHARI_DATA;

  // --- Utility: Escape HTML ---
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Build a single verse card HTML ---
  function buildVerseCard(sloka) {
    var num = sloka.num;
    var isAnanda = num <= 41;
    var sectionClass = isAnanda ? 'ananda-verse' : 'soundarya-verse';
    var sectionTag = isAnanda ? 'Ananda' : 'Soundarya';

    // Preview: first line of Sanskrit
    var preview = sloka.sanskrit.split('\n')[0];
    if (preview.length > 50) preview = preview.substring(0, 50) + '...';

    var html = '<div class="verse-card ' + sectionClass + '" id="verse-' + num + '">';

    // Header
    html += '<div class="verse-header" onclick="toggleVerse(' + num + ')">';
    html += '<span class="verse-number">' + num + '</span>';
    html += '<span class="verse-text-preview">' + escapeHtml(preview) + '</span>';
    html += '<span class="verse-section-tag">' + sectionTag + '</span>';
    html += '<span class="verse-toggle">&#9660;</span>';
    html += '</div>';

    // Body
    html += '<div class="verse-body">';

    // Sanskrit text
    html += '<div class="sanskrit-block">' + escapeHtml(sloka.sanskrit) + '</div>';

    // Transliteration
    html += '<div class="transliteration-block">' + escapeHtml(sloka.transliteration) + '</div>';

    // Meaning
    html += '<div class="meaning-block">';
    html += '<div class="meaning-label">Meaning</div>';
    html += '<div class="meaning-text">' + escapeHtml(sloka.meaning) + '</div>';
    html += '</div>';

    // Esoteric interpretation
    html += '<div class="esoteric-block">';
    html += '<div class="esoteric-label">Esoteric Interpretation</div>';
    html += '<div class="esoteric-text">' + escapeHtml(sloka.esoteric) + '</div>';
    html += '</div>';

    html += '</div>'; // verse-body
    html += '</div>'; // verse-card

    return html;
  }

  // --- Build expand/collapse controls ---
  function buildControls(idPrefix) {
    return '<div class="expand-controls">' +
      '<button class="expand-btn" data-action="expand" data-target="' + idPrefix + '">Expand All</button>' +
      '<button class="expand-btn" data-action="collapse" data-target="' + idPrefix + '">Collapse All</button>' +
      '</div>';
  }

  // --- Render All Slokas ---
  function renderAllSlokas() {
    var container = document.getElementById('all-slokas-container');
    var html = buildControls('all');

    slokas.forEach(function (sloka) {
      html += buildVerseCard(sloka);
    });

    container.innerHTML = html;

    // Expand first 3 by default
    for (var i = 1; i <= 3; i++) {
      var el = document.getElementById('verse-' + i);
      if (el) el.classList.add('expanded');
    }
  }

  // --- Render Ananda Lahari (1-41) ---
  function renderAnandaLahari() {
    var container = document.getElementById('ananda-container');
    var anandaSlokas = slokas.filter(function (s) { return s.num <= 41; });

    var html = buildControls('ananda');

    anandaSlokas.forEach(function (sloka) {
      html += buildVerseCard(sloka);
    });

    container.innerHTML = html;
  }

  // --- Render Soundarya Lahari (42-103) ---
  function renderSoundaryaLahari() {
    var container = document.getElementById('soundarya-container');
    var soundaryaSlokas = slokas.filter(function (s) { return s.num >= 42; });

    var html = buildControls('soundarya');

    soundaryaSlokas.forEach(function (sloka) {
      html += buildVerseCard(sloka);
    });

    container.innerHTML = html;
  }

  // --- Toggle verse expansion ---
  window.toggleVerse = function (num) {
    var el = document.getElementById('verse-' + num);
    if (el) el.classList.toggle('expanded');
  };

  // --- Expand/Collapse All handler ---
  function setupExpandCollapse() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.expand-btn');
      if (!btn) return;

      var action = btn.getAttribute('data-action');
      var container = btn.closest('.section-block');
      if (!container) return;

      var cards = container.querySelectorAll('.verse-card');
      cards.forEach(function (card) {
        if (action === 'expand') {
          card.classList.add('expanded');
        } else {
          card.classList.remove('expanded');
        }
      });
    });
  }

  // --- Search ---
  function setupSearch() {
    var input = document.getElementById('search-input');
    var results = document.getElementById('search-results');
    var count = document.getElementById('search-count');

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      if (query.length < 2) {
        results.innerHTML = '<p style="text-align:center;color:#6b5744;padding:2rem;">Type at least 2 characters to search...</p>';
        count.textContent = '';
        return;
      }

      var matches = slokas.filter(function (sloka) {
        return (
          String(sloka.num) === query ||
          sloka.sanskrit.toLowerCase().includes(query) ||
          sloka.transliteration.toLowerCase().includes(query) ||
          sloka.meaning.toLowerCase().includes(query) ||
          sloka.esoteric.toLowerCase().includes(query)
        );
      });

      count.textContent = matches.length + ' found';

      if (matches.length === 0) {
        results.innerHTML = '<p style="text-align:center;color:#6b5744;padding:2rem;">No verses found matching "' + escapeHtml(query) + '"</p>';
        return;
      }

      var html = '';
      matches.forEach(function (sloka) {
        html += buildVerseCard(sloka);
      });
      results.innerHTML = html;

      // Expand all search results
      results.querySelectorAll('.verse-card').forEach(function (card) {
        card.classList.add('expanded');
      });
    });
  }

  // --- View Navigation ---
  function setupNavigation() {
    var buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var viewId = btn.getAttribute('data-view');

        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        document.querySelectorAll('.view').forEach(function (v) {
          v.classList.remove('active');
        });
        document.getElementById(viewId + '-view').classList.add('active');
      });
    });
  }

  // --- Reading Progress ---
  function setupProgressBar() {
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      document.getElementById('progressBar').style.width = progress + '%';
    });
  }

  // --- Initialize ---
  function init() {
    renderAllSlokas();
    renderAnandaLahari();
    renderSoundaryaLahari();
    setupSearch();
    setupNavigation();
    setupExpandCollapse();
    setupProgressBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
