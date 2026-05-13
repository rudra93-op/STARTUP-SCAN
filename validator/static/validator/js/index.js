const msgs = [
  'Fetching market news...',
  'Analyzing competitors...',
  'Running SWOT analysis...',
  'Building financial model...',
  'Generating report...'
];

let msgTimer;

function cycleMsgs() {
  let i = 0;
  msgTimer = setInterval(() => {
    document.getElementById('ld-t').textContent = msgs[i % msgs.length];
    i++;
  }, 1800);
}

async function validate() {
  const idea = document.getElementById('idea').value.trim();
  const errEl = document.getElementById('err');
  const btn = document.getElementById('btn');

  if (idea.length < 15) {
    errEl.style.display = 'block';
    errEl.textContent = 'Please describe your idea in a bit more detail.';
    return;
  }

  errEl.style.display = 'none';
  btn.disabled = true;
  document.getElementById('loading').style.display = 'flex';
  cycleMsgs();

  try {
    const res = await fetch('/api/validate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea })
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Something went wrong');
    }

    sessionStorage.setItem('reportData', JSON.stringify(json.data));
    if (json.data.idea_id) {
      window.location.href = `/report/?id=${json.data.idea_id}`;
    } else {
      window.location.href = '/report/';
    }
  } catch (e) {
    clearInterval(msgTimer);
    document.getElementById('loading').style.display = 'none';
    errEl.style.display = 'block';
    errEl.textContent = e.message;
    btn.disabled = false;
  }
}
