/* Sebastian Sahli — sahlisebastian.ch
   Desktop icons, draggable windows, and a live publications feed. */

/* =======================================================================
   CONFIG — the only part you normally need to touch
   ======================================================================= */
const CONFIG = {
  // Your ORCID iD. This is what the publications feed matches on.
  orcid: '0000-0002-2030-0313',

  // OpenAlex asks for a contact address so they can reach you if a script
  // misbehaves. It also puts you in their faster pool. Not published anywhere.
  mailto: 'sahlisebastian@gmail.com',

  // Bold this name wherever it appears in an author list.
  highlightSurname: 'Sahli',

  // Only used as a fallback, if OpenAlex has no works linked to the ORCID yet.
  authorName: 'Sebastian Sahli',

  // Max publications to show. Set higher if you want the full list.
  maxPubs: 100
};

/* =======================================================================
   WINDOWS
   ======================================================================= */
let zTop = 10;
let cascade = 0;

function openWindow(key) {
  const win = document.getElementById('win-' + key);
  if (!win) return;

  // Fresh opens cascade down-right from centre so stacked windows stay
  // distinguishable. A window the visitor already dragged keeps its place.
  const wide = !window.matchMedia('(max-width: 640px)').matches;
  if (win.hidden && wide && !win.dataset.moved) {
    const step = (cascade++ % 4) * 26;
    win.style.left = '50%';
    win.style.top = '50%';
    win.style.transform = 'translate(calc(-50% + ' + step + 'px), calc(-50% + ' + step + 'px))';
  }

  win.hidden = false;
  win.style.zIndex = ++zTop;
  if (key === 'pubs') loadPublications();
  win.querySelector('.close').focus({ preventScroll: true });
}

function closeWindow(win) {
  win.hidden = true;
}

document.querySelectorAll('.icon').forEach(function (btn) {
  btn.addEventListener('click', function () {
    openWindow(btn.dataset.window);
  });
});

document.querySelectorAll('.window').forEach(function (win) {
  win.querySelector('.close').addEventListener('click', function () {
    closeWindow(win);
  });
  // Clicking anywhere in a window raises it above the others.
  win.addEventListener('mousedown', function () {
    win.style.zIndex = ++zTop;
  });
  makeDraggable(win);
});

// Esc closes the topmost open window.
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  const open = Array.prototype.filter
    .call(document.querySelectorAll('.window'), function (w) { return !w.hidden; })
    .sort(function (a, b) { return (+a.style.zIndex || 0) - (+b.style.zIndex || 0); });
  if (open.length) closeWindow(open[open.length - 1]);
});

/* Drag by the title bar. Skipped on narrow screens, where windows are
   docked to the bottom edge like a sheet. */
function makeDraggable(win) {
  const bar = win.querySelector('.titlebar');
  let startX = 0, startY = 0, baseX = 0, baseY = 0, dragging = false;

  bar.addEventListener('mousedown', function (e) {
    if (e.target.classList.contains('close')) return;
    if (window.matchMedia('(max-width: 640px)').matches) return;

    // Convert the CSS centering transform into concrete left/top once,
    // so dragging math stays simple from here on.
    const r = win.getBoundingClientRect();
    win.style.transform = 'none';
    win.style.left = r.left + 'px';
    win.style.top  = r.top  + 'px';

    dragging = true;
    win.dataset.moved = '1';
    startX = e.clientX; startY = e.clientY;
    baseX = r.left;     baseY = r.top;
    win.style.zIndex = ++zTop;
    e.preventDefault();
  });

  window.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    let x = baseX + (e.clientX - startX);
    let y = baseY + (e.clientY - startY);

    // Keep at least a sliver of the title bar reachable.
    const w = win.offsetWidth, h = win.offsetHeight;
    x = Math.min(Math.max(x, 40 - w), window.innerWidth - 40);
    y = Math.min(Math.max(y, 0), window.innerHeight - 34);

    win.style.left = x + 'px';
    win.style.top  = y + 'px';
  });

  window.addEventListener('mouseup', function () { dragging = false; });
}

/* =======================================================================
   PUBLICATIONS — live from OpenAlex, matched on ORCID
   ======================================================================= */
let pubsLoaded = false;

function loadPublications() {
  if (pubsLoaded) return;
  pubsLoaded = true;

  const status = document.getElementById('pub-status');
  const list   = document.getElementById('pub-list');

  if (!CONFIG.orcid) {
    status.textContent = 'No ORCID configured — set CONFIG.orcid in app.js.';
    return;
  }

  function worksUrl(filter) {
    return 'https://api.openalex.org/works'
      + '?filter=' + filter
      + '&sort=publication_date:desc'
      + '&per-page=' + CONFIG.maxPubs
      + '&mailto=' + encodeURIComponent(CONFIG.mailto);
  }

  function getJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  status.textContent = 'Loading…';

  getJSON(worksUrl('author.orcid:' + CONFIG.orcid))
    .then(function (data) {
      // If OpenAlex hasn't linked the ORCID to any works yet, fall back to
      // resolving the author by name and querying on their OpenAlex ID.
      if ((data.results || []).length) return data;
      return getJSON('https://api.openalex.org/authors?search='
                     + encodeURIComponent(CONFIG.authorName)
                     + '&mailto=' + encodeURIComponent(CONFIG.mailto))
        .then(function (a) {
          const top = (a.results || [])[0];
          if (!top) return data;
          return getJSON(worksUrl('author.id:' + top.id.replace(/^https?:\/\/openalex\.org\//, '')));
        });
    })
    .then(function (data) {
      const works = data.results || [];
      if (!works.length) {
        status.innerHTML = 'Nothing indexed under this ORCID yet. '
          + '<a href="https://scholar.google.com/citations?hl=en&user=7SAQaFQAAAAJ" '
          + 'target="_blank" rel="noopener">See Google Scholar &nearr;</a>';
        return;
      }
      status.textContent = works.length + ' publications, newest first.';
      works.forEach(function (w) { list.appendChild(renderPub(w)); });
    })
    .catch(function (err) {
      pubsLoaded = false;   // let a re-open retry
      status.innerHTML = 'Could not load the feed ('
        + String(err.message).replace(/[<>&"]/g, '') + '). '
        + '<a href="https://scholar.google.com/citations?hl=en&user=7SAQaFQAAAAJ" '
        + 'target="_blank" rel="noopener">See Google Scholar &nearr;</a>';
    });
}

function renderPub(w) {
  const li = document.createElement('li');

  // Authors — surname-first list, with your own name in bold.
  const names = (w.authorships || []).map(function (a) {
    return (a.author && a.author.display_name) || '';
  }).filter(Boolean);

  const authors = document.createElement('span');
  authors.className = 'pub-authors';
  names.forEach(function (n, i) {
    const isMe = n.toLowerCase().indexOf(CONFIG.highlightSurname.toLowerCase()) !== -1;
    const el = document.createElement(isMe ? 'strong' : 'span');
    if (isMe) el.className = 'me';
    el.textContent = n;
    authors.appendChild(el);
    if (i < names.length - 1) authors.appendChild(document.createTextNode(', '));
  });

  // Title, linked to the DOI when there is one.
  const title = document.createElement(w.doi ? 'a' : 'span');
  title.className = 'pub-title';
  title.textContent = w.display_name || 'Untitled';
  if (w.doi) {
    title.href = w.doi;
    title.target = '_blank';
    title.rel = 'noopener';
  }

  const venueName =
    (w.primary_location && w.primary_location.source && w.primary_location.source.display_name) || '';
  const venue = document.createElement('span');
  venue.className = 'pub-venue';
  venue.textContent = [venueName, w.publication_year].filter(Boolean).join(', ');

  li.appendChild(authors);
  li.appendChild(document.createTextNode('. '));
  li.appendChild(title);
  li.appendChild(document.createTextNode('. '));
  li.appendChild(venue);

  if (w.cited_by_count > 0) {
    const c = document.createElement('span');
    c.className = 'cites';
    c.textContent = w.cited_by_count + (w.cited_by_count === 1 ? ' citation' : ' citations');
    li.appendChild(c);
  }

  return li;
}

/* =======================================================================
   TASKBAR CLOCK
   ======================================================================= */
function tick() {
  const el = document.getElementById('clock');
  if (!el) return;
  const d = new Date();
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  el.textContent = date + '  ' + time;
}
tick();
setInterval(tick, 30000);
