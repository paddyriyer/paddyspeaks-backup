// Abhirami Andhadhi - Interactive Application
// =============================================

(function () {
  'use strict';

  var verses = ABHIRAMI_ANDHADHI_DATA;

  // --- Utility: Escape HTML ---
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Build a single verse card HTML ---
  function buildVerseCard(verse) {
    var num = verse.num;
    var isKaappu = num === 0;
    var label = isKaappu ? 'Kaappu' : String(num);
    var cardClass = isKaappu ? 'kaappu-verse' : (num <= 50 ? 'first-half-verse' : 'second-half-verse');

    // Preview: first line of Tamil
    var preview = verse.tamil.split('\n')[0];
    if (preview.length > 60) preview = preview.substring(0, 60) + '...';

    var html = '<div class="verse-card ' + cardClass + '" id="verse-' + num + '">';

    // Header
    html += '<div class="verse-header" onclick="toggleVerse(' + num + ')">';
    html += '<span class="verse-number">' + label + '</span>';
    html += '<span class="verse-text-preview">' + escapeHtml(preview) + '</span>';
    if (isKaappu) {
      html += '<span class="verse-section-tag">Invocation</span>';
    }
    html += '<span class="verse-toggle">&#9660;</span>';
    html += '</div>';

    // Body
    html += '<div class="verse-body">';

    // Tamil text
    html += '<div class="tamil-block">' + escapeHtml(verse.tamil) + '</div>';

    // Transliteration
    html += '<div class="transliteration-block">' + escapeHtml(verse.transliteration) + '</div>';

    // Meaning
    html += '<div class="meaning-block">';
    html += '<div class="meaning-label">Meaning</div>';
    html += '<div class="meaning-text">' + escapeHtml(verse.meaning) + '</div>';
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

  // --- Render All Verses ---
  function renderAllVerses() {
    var container = document.getElementById('all-container');
    var html = buildControls('all');

    verses.forEach(function (verse) {
      html += buildVerseCard(verse);
    });

    container.innerHTML = html;

    // Expand kaappu and first 2 verses by default
    for (var i = 0; i <= 2; i++) {
      var el = document.getElementById('verse-' + i);
      if (el) el.classList.add('expanded');
    }
  }

  // --- Render First 50 ---
  function renderFirst50() {
    var container = document.getElementById('first50-container');
    var filtered = verses.filter(function (v) { return v.num >= 1 && v.num <= 50; });

    var html = buildControls('first50');
    filtered.forEach(function (verse) {
      html += buildVerseCard(verse);
    });

    container.innerHTML = html;
  }

  // --- Render Last 50 ---
  function renderLast50() {
    var container = document.getElementById('last50-container');
    var filtered = verses.filter(function (v) { return v.num >= 51 && v.num <= 100; });

    var html = buildControls('last50');
    filtered.forEach(function (verse) {
      html += buildVerseCard(verse);
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

      var matches = verses.filter(function (verse) {
        return (
          String(verse.num) === query ||
          verse.tamil.toLowerCase().includes(query) ||
          verse.transliteration.toLowerCase().includes(query) ||
          verse.meaning.toLowerCase().includes(query)
        );
      });

      count.textContent = matches.length + ' found';

      if (matches.length === 0) {
        results.innerHTML = '<p style="text-align:center;color:#6b5744;padding:2rem;">No verses found matching "' + escapeHtml(query) + '"</p>';
        return;
      }

      var html = '';
      matches.forEach(function (verse) {
        html += buildVerseCard(verse);
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

  // --- Generate PDF (chunked to avoid canvas size limits) ---
  function buildVerseBlockHtml(verse) {
    var num = verse.num;
    var label = num === 0 ? 'Kaappu (Invocation)' : 'Verse ' + num;
    if (num === 101) label = 'Noorpayan (Benefit)';
    var borderColor = num === 0 ? '#b8860b' : '#c41e3a';

    var block = '<div style="page-break-inside:avoid;margin-bottom:20px;padding:14px;border:1px solid #d4c4b0;border-left:4px solid ' +
      borderColor + ';border-radius:6px;background:#fff;">';
    block += '<div style="font-weight:700;font-size:14px;color:#c41e3a;margin-bottom:8px;">' + label + '</div>';
    block += '<div style="font-size:15px;line-height:2;text-align:center;padding:10px;background:#f7efe3;border-radius:4px;margin-bottom:8px;white-space:pre-line;">' +
      escapeHtml(verse.tamil) + '</div>';
    block += '<div style="font-size:13px;line-height:1.8;text-align:center;font-style:italic;color:#2c1810;margin-bottom:8px;white-space:pre-line;">' +
      escapeHtml(verse.transliteration) + '</div>';
    if (verse.meaning) {
      block += '<div style="font-size:12px;line-height:1.6;padding:8px 10px;border-left:3px solid #b8860b;background:#fffef8;">' +
        '<strong style="color:#b8860b;font-size:11px;text-transform:uppercase;">Meaning</strong><br>' +
        escapeHtml(verse.meaning) + '</div>';
    }
    block += '</div>';
    return block;
  }

  function createPdfChunk(htmlContent) {
    var el = document.createElement('div');
    el.style.cssText = "font-family:'Noto Sans Tamil','Source Serif 4',Georgia,serif;color:#2c1810;padding:15px;width:700px;position:absolute;left:-9999px;top:0;";
    el.innerHTML = htmlContent;
    document.body.appendChild(el);
    return el;
  }

  window.generatePDF = function () {
    var btn = document.getElementById('downloadPdfBtn');
    btn.textContent = 'Generating PDF...';
    btn.disabled = true;

    var CHUNK_SIZE = 10;
    var chunks = [];

    // Title page chunk
    var titleHtml = '<div style="text-align:center;padding:40px 20px;">' +
      '<div style="margin-bottom:60px;"></div>' +
      '<h1 style="font-size:32px;color:#c41e3a;margin-bottom:12px;">Abhirami Andhadhi</h1>' +
      '<p style="font-size:20px;color:#6b5744;margin-bottom:8px;">அபிராமி அந்தாதி</p>' +
      '<p style="font-size:14px;color:#6b5744;margin-bottom:4px;">100 Verses of Devotion to the Divine Mother</p>' +
      '<p style="font-size:13px;color:#999;margin-top:30px;">By Abhirami Bhattar &middot; Thirukkadaiyur</p>' +
      '<p style="font-size:12px;color:#999;margin-top:4px;">அபிராமி பட்டர்</p>' +
      '</div>';
    chunks.push(titleHtml);

    // Verse chunks (10 verses per chunk)
    for (var i = 0; i < verses.length; i += CHUNK_SIZE) {
      var chunkHtml = '';
      var end = Math.min(i + CHUNK_SIZE, verses.length);
      for (var j = i; j < end; j++) {
        chunkHtml += buildVerseBlockHtml(verses[j]);
      }
      chunks.push(chunkHtml);
    }

    // Footer chunk
    chunks.push('<div style="text-align:center;padding:40px 20px;font-size:13px;color:#6b5744;">' +
      '<p style="font-size:16px;margin-bottom:8px;">Om Shreem Abhirami Namaha</p>' +
      '<p>Abhirami Andhadhi — Composed by Abhirami Bhattar at Thirukkadaiyur</p>' +
      '<p style="margin-top:4px;">A PaddySpeaks creation &middot; paddyspeaks.com</p></div>');

    var opt = {
      margin: [10, 10, 10, 10],
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Process chunks sequentially, appending pages
    var worker = html2pdf().set(opt);
    var chunkIndex = 0;

    function processNextChunk() {
      if (chunkIndex >= chunks.length) {
        // All chunks done — save
        worker.save('Abhirami-Andhadhi.pdf').then(function () {
          btn.textContent = 'Download PDF';
          btn.disabled = false;
        });
        return;
      }

      var el = createPdfChunk(chunks[chunkIndex]);
      var isFirst = chunkIndex === 0;
      chunkIndex++;

      // Let the browser render the element before capturing
      requestAnimationFrame(function () {
        setTimeout(function () {
          if (isFirst) {
            worker.from(el).toContainer().toCanvas().toPdf().get('pdf').then(function (pdf) {
              document.body.removeChild(el);
              processNextChunk();
            });
          } else {
            worker.get('pdf').then(function (pdf) {
              pdf.addPage();
            }).from(el).toContainer().toCanvas().toPdf().get('pdf').then(function (pdf) {
              document.body.removeChild(el);
              processNextChunk();
            });
          }
        }, 50);
      });
    }

    processNextChunk();
  };

  // --- Initialize ---
  function init() {
    renderAllVerses();
    renderFirst50();
    renderLast50();
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
