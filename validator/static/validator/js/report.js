function scCol(s) {
  return s >= 70 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
}

function esc(s) {
  if (!s) {
    return '';
  }

  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function ring(sc, lbl, sz, sw) {
  const r = (sz / 2) - sw;
  const ci = 2 * Math.PI * r;
  const da = ci - ((sc / 100) * ci);
  const col = scCol(sc);
  const fs = sz < 52 ? '12px' : '22px';
  const fw = sz < 52 ? '700' : '900';

  return `<div class="rsring"><div style="position:relative;width:${sz}px;height:${sz}px">
    <svg width="${sz}" height="${sz}" style="transform:rotate(-90deg);position:absolute;inset:0">
      <circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="${sw}"/>
      <circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-dasharray="${ci}" stroke-dashoffset="${da}" stroke-linecap="round"/>
    </svg>
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${fs};font-weight:${fw};color:#fff">${sc}</div>
  </div>${lbl ? `<div class="rsring-lbl">${lbl}</div>` : ''}</div>`;
}

function sbar(nm, val) {
  const col = scCol(val);
  return `<div class="sbar"><div class="sbar-top"><span class="sbar-nm">${esc(nm)}</span><span class="sbar-vl" style="color:${col}">${val}/100</span></div><div class="sbar-tr"><div class="sbar-fi" data-w="${val}" style="background:${col}"></div></div></div>`;
}

function animateBars() {
  requestAnimationFrame(() => {
    document.querySelectorAll('[data-w]').forEach((el) => {
      el.style.width = `${el.dataset.w}%`;
    });
  });
}

function switchTab(t) {
  document.querySelectorAll('.tab-btn').forEach((b) => {
    b.classList.toggle('on', b.dataset.tab === t);
  });

  document.querySelectorAll('.tab-panel').forEach((p) => {
    p.style.display = p.id === `tp-${t}` ? 'block' : 'none';
  });

  setTimeout(animateBars, 80);
}

function render(d) {
  const vc = d.verdict === 'Go' ? 'go' : d.verdict === 'Caution' ? 'caut' : 'no';
  const vi = d.verdict === 'Go' ? 'Go' : d.verdict === 'Caution' ? 'Caution' : 'No-Go';
  const pv = d.problem_validation || {};
  const sv = d.solution_validation || {};
  const mv = d.market_validation || {};
  const mf = d.market_factors || {};
  const ef = d.execution_factors || {};
  const tam = d.tam || {};
  const sam = d.sam || {};
  const som = d.som || {};
  const mat = (d.market_maturity || 'Growing').toLowerCase();
  const mbcls = mat.includes('grow') ? 'm-growing' : mat.includes('emerg') ? 'm-emerging' : 'm-mature';

  const glHTML = (d.green_lights || [])
    .map((g) => `<div class="gl-item">${esc(g)}</div>`)
    .join('');
  const rfHTML = (d.red_flags || [])
    .map((r) => `<div class="gl-item">${esc(r)}</div>`)
    .join('');
  const ksHTML = (d.key_strengths || [])
    .map((s) => `<div class="gl-item">${esc(s)}</div>`)
    .join('');
  const acHTML = (d.areas_of_concern || [])
    .map((c) => `<div class="gl-item">${esc(c)}</div>`)
    .join('');
  const recsHTML = (d.key_recommendations || [])
    .map((r, i) => `<li style="display:flex;gap:8px;font-size:13px;color:#374151;line-height:1.4;margin-bottom:8px"><span style="min-width:18px;height:18px;background:#7c3aed;color:#fff;border-radius:4px;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i + 1}</span>${esc(r)}</li>`)
    .join('');
  const compRows = (d.competitors || [])
    .map((c) => `<tr><td class="cn">${esc(c.name)}</td><td>${esc(c.strengths)}</td><td>${esc(c.weaknesses)}</td></tr>`)
    .join('');
  const mpHTML = (d.market_potential_points || [])
    .map((p) => `<li style="font-size:13px;color:#374151;line-height:1.5;margin-bottom:10px">${esc(p)}</li>`)
    .join('');
  const rmHTML = (d.roadmap || [])
    .map((ph) => `<div class="rm-phase"><div class="rm-hd"><span class="rm-chip">${esc(ph.phase)}</span><span class="rm-title">${esc(ph.title)}</span><span class="rm-dur">${esc(ph.duration)}</span></div><ul class="rm-goals">${(ph.goals || []).map((g) => `<li>${esc(g)}</li>`).join('')}</ul></div>`)
    .join('');
  const segHTML = (d.customer_segments || [])
    .map((s) => `<div class="cseg"><div class="cseg-pct">${s.percentage || 0}%</div><div class="cseg-nm">${esc(s.name)}</div><div class="cseg-desc">${esc(s.description)}</div></div>`)
    .join('');
  const ppHTML = (d.pain_points || [])
    .map((p) => `<div class="pp-item"><div class="pp-dot"></div><div class="pp-text">${esc(p)}</div></div>`)
    .join('');

  const tabs = [
    ['summary', 'Summary'],
    ['scores', 'Scores'],
    ['market', 'Market'],
    ['financials', 'Financials'],
    ['roadmap', 'Roadmap'],
    ['journey', 'Journey'],
  ];

  document.getElementById('app').innerHTML = `
    <div class="rhead">
        <div class="rhead-bar">
          <div class="rhl">
            <a href="/" style="color:rgba(255,255,255,.4);font-size:13px;text-decoration:none;margin-right:4px">Back</a>
            <span class="rtitle">Validation Report</span>
            <span class="chip chip-g">Ready</span>
            <span class="chip chip-p">Step 1/3</span>
            <span class="chip chip-s">${esc(d.timeline || '3-4 months')}</span>
          </div>
        <div class="rscores">
          ${ring(d.risk || 50, 'RISK', 44, 4)}
          ${ring(d.difficulty || 50, 'DIFF', 44, 4)}
          ${ring(d.confidence || 60, 'CONF', 44, 4)}
          ${ring(d.score || 65, 'SCORE', 72, 6)}
        </div>
      </div>
      <div class="rsum-bar">${esc(d.summary || '')}</div>
    </div>
    <div class="tabs">${tabs.map(([id, lbl]) => `<button class="tab-btn" data-tab="${id}" onclick="switchTab('${id}')">${lbl}</button>`).join('')}</div>
    <div class="tcontent" id="tc">
      <div id="tp-summary" class="tab-panel">
        <div class="sum-layout">
            <div>
              <div class="wc">
                <div class="wc-head"><span class="wc-title">Executive Summary</span></div>
                <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:18px">${esc(d.summary)}</p>
                <div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:10px">Key Recommendations</div>
                <ol style="list-style:none">${recsHTML}</ol>
              </div>
              <div class="wc">
                <div class="wc-head"><span class="wc-title">Validation Scorecard</span></div>
                <div class="vscard">
                ${[['Problem Validation', pv], ['Solution Validation', sv], ['Market Validation', mv]].map(([nm, obj]) => {
                  const sc = obj.score || 60;
                  const col = scCol(sc);
                  return `<div class="vsc"><div class="vsc-top"><span class="vsc-nm">${nm}</span><span class="vsc-num" style="color:${col}">${sc}/100</span></div><div class="vsc-bar"><div class="vsc-fi" data-w="${sc}" style="background:${col}"></div></div><div class="vsc-desc">${esc(obj.description || '')}</div></div>`;
                }).join('')}
              </div>
              </div>
              <div class="two-col">
                <div class="wc"><div class="wc-head"><span class="wc-title" style="color:#065f46">Key Strengths</span></div><div class="gl-list">${ksHTML}</div></div>
                <div class="wc"><div class="wc-head"><span class="wc-title" style="color:#991b1b">Areas of Concern</span></div><div class="gl-list">${acHTML}</div></div>
              </div>
            <div class="wc"><div class="verd verd-${vc}"><div><div class="verd-lbl">Final Verdict</div><div class="verd-ttl">${vi}</div></div><div class="verd-rsn">${esc(d.verdict_reason)}</div></div></div>
            </div>
            <div>
              <div class="wc"><div class="wc-head"><span class="wc-title" style="color:#065f46">Green Lights</span></div><div class="gl-list">${glHTML}</div></div>
              <div class="wc"><div class="wc-head"><span class="wc-title" style="color:#991b1b">Red Flags</span></div><div class="gl-list">${rfHTML}</div></div>
            </div>
          </div>
        </div>

        <div id="tp-scores" class="tab-panel" style="display:none">
          <div class="two-col">
            <div class="wc"><div class="wc-head"><span class="wc-title">Market Factors</span></div>
              ${sbar('Target Market Clarity', mf.target_market_clarity || 65)}
            ${sbar('Market Timing', mf.market_timing || 70)}
            ${sbar('Market Entry Barriers', mf.market_entry_barriers || 50)}
            ${sbar('Competition Level', mf.competition_level || 45)}
            ${sbar('Problem-Solution Fit', mf.problem_solution_fit || 75)}
          </div>
            <div class="wc"><div class="wc-head"><span class="wc-title">Execution Factors</span></div>
              ${sbar('MVP Viability', ef.mvp_viability || 68)}
            ${sbar('Value Proposition', ef.value_proposition || 70)}
            ${sbar('Initial Feasibility', ef.initial_feasibility || 60)}
            ${sbar('Resource Requirements', ef.resource_requirements || 55)}
          </div>
        </div>
          <div class="wc"><div class="wc-head"><span class="wc-title">Overall Score Breakdown</span></div>
            ${sbar('Overall Viability', d.score || 65)}
          ${sbar('Risk Score', 100 - (d.risk || 50))}
          ${sbar('Execution Difficulty', 100 - (d.difficulty || 50))}
          ${sbar('Analysis Confidence', d.confidence || 60)}
        </div>
      </div>

        <div id="tp-market" class="tab-panel" style="display:none">
          <div class="wc">
            <div class="wc-head"><span class="wc-title">Market Size</span></div>
            <div class="tam-viz">
            <div class="concentric">
              <div class="c-tam"></div><div class="c-sam"></div>
              <div class="c-som">SOM</div>
              <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);font-size:9px;font-weight:700;color:#7c3aed">TAM</div>
              <div style="position:absolute;top:26px;left:50%;transform:translateX(-50%);font-size:9px;font-weight:700;color:#5b21b6">SAM</div>
            </div>
            <div class="tam-labels">
              <div><div class="tam-tag">TAM</div><div class="tam-text"><strong>${esc(tam.value)}</strong> - ${esc(tam.description)}</div></div>
              <div><div class="tam-tag">SAM</div><div class="tam-text"><strong>${esc(sam.value)}</strong> - ${esc(sam.description)}</div></div>
              <div><div class="tam-tag">SOM</div><div class="som-text"><strong>${esc(som.value)}</strong> - ${esc(som.description)}</div></div>
            </div>
          </div>
          </div>
          <div class="two-col">
            <div class="wc"><div class="wc-head"><span class="wc-title">Market Stage</span></div>
              <div class="ms-row"><span class="ms-k">Market Maturity</span><span class="ms-v"><span class="mbadge ${mbcls}">${esc(d.market_maturity || 'Growing')}</span></span></div>
              <div class="ms-row"><span class="ms-k">Seasonality</span><span class="ms-v">${esc(d.seasonality || '-')}</span></div>
              <div style="padding-top:10px"><div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#9ca3af;text-transform:uppercase;margin-bottom:6px">Target Regions</div><div class="rtags">${(d.target_regions || []).map((r) => `<span class="rtag">${esc(r)}</span>`).join('')}</div></div>
            </div>
            <div class="wc"><div class="wc-head"><span class="wc-title">Market Potential</span></div><ul style="list-style:none">${mpHTML}</ul></div>
          </div>
          <div class="wc"><div class="wc-head"><span class="wc-title">Competitive Landscape</span></div>
            <table class="comp-tbl"><thead><tr><th>Competitor</th><th>Strengths</th><th>Weaknesses</th></tr></thead><tbody>${compRows}</tbody></table>
          </div>
        </div>

        <div id="tp-financials" class="tab-panel" style="display:none">
          <div class="wc">
            <div class="wc-head"><span class="wc-title">Revenue Projections</span></div>
            <div class="fin-grid">
              <div class="fin-c"><div class="fin-yr">Year 1</div><div class="fin-v">${esc(d.year1_revenue || '-')}</div></div>
              <div class="fin-c"><div class="fin-yr">Year 2</div><div class="fin-v">${esc(d.year2_revenue || '-')}</div></div>
              <div class="fin-c"><div class="fin-yr">Year 3</div><div class="fin-v">${esc(d.year3_revenue || '-')}</div></div>
            </div>
            <div class="fin-stats">
              <div class="fin-c"><div class="fin-yr">Monthly Burn</div><div class="fin-v" style="font-size:14px">${esc(d.burn_rate || '-')}</div></div>
              <div class="fin-c"><div class="fin-yr">Break Even</div><div class="fin-v" style="font-size:14px">${esc(d.break_even || '-')}</div></div>
              <div class="fin-c"><div class="fin-yr">Funding Needed</div><div class="fin-v" style="font-size:14px">${esc(d.funding_needed || '-')}</div></div>
            </div>
          </div>
          <div class="two-col">
            <div class="wc"><div class="wc-head"><span class="wc-title">Revenue Model</span></div><p style="font-size:14px;color:#374151;line-height:1.6">${esc(d.revenue_model || '-')}</p></div>
            <div class="wc"><div class="wc-head"><span class="wc-title">Pricing Strategy</span></div><p style="font-size:14px;color:#374151;line-height:1.6">${esc(d.pricing_strategy || '-')}</p></div>
          </div>
        </div>

        <div id="tp-roadmap" class="tab-panel" style="display:none">
          <div class="wc"><div class="wc-head"><span class="wc-title">Startup Roadmap</span></div><div class="rm-phases">${rmHTML}</div></div>
        </div>

        <div id="tp-journey" class="tab-panel" style="display:none">
          <div class="wc"><div class="wc-head"><span class="wc-title">Customer Segments</span></div><div class="csegs">${segHTML}</div></div>
          <div class="wc"><div class="wc-head"><span class="wc-title">Validated Pain Points</span></div>${ppHTML}</div>
        </div>
    </div>`;

  switchTab('summary');
}

window.addEventListener('DOMContentLoaded', async () => {
  const raw = sessionStorage.getItem('reportData');
  const params = new URLSearchParams(window.location.search);
  const ideaId = params.get('id');
  const noDataEl = document.getElementById('no-data');

  if (raw) {
    try {
      const d = JSON.parse(raw);
      render(d);
      document.getElementById('report-actions').style.display = 'block';
      return;
    } catch (e) {
      // fall through to server fetch if data cannot be parsed
    }
  }

  if (ideaId) {
    try {
      const res = await fetch(`/api/idea/${ideaId}/`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Unable to load report');
      }
      render(json.data);
      document.getElementById('report-actions').style.display = 'block';
      return;
    } catch (e) {
      console.error(e);
    }
  }

  noDataEl.style.display = 'flex';
});
