const trackingData = {
  'CCL-1024': { status: 'In Transit', location: 'Mumbai -> Vadodara', temp: '4.2°C', target: '2°C - 8°C', progress: 68, updated: '2 min ago' },
  'CCL-2088': { status: 'Out for Delivery', location: 'Bengaluru -> Chennai', temp: '-18.4°C', target: '-20°C or below', progress: 91, updated: '5 min ago' },
  'CCL-3301': { status: 'Delivered', location: 'Pune -> Mumbai', temp: '6.1°C', target: '2°C - 8°C', progress: 100, updated: '42 min ago' }
};

const trackingForm = document.getElementById('trackingForm');
const trackingId = document.getElementById('trackingId');
const trackingResult = document.getElementById('trackingResult');
const sampleButtons = document.querySelectorAll('[data-sample]');

function renderTracking(id) {
  const key = String(id).trim().toUpperCase();
  const data = trackingData[key];
  if (!data) {
    trackingResult.innerHTML = `<div class="track-state"><div class="state-badge">!</div><div><strong>Shipment not found</strong><small>Try CCL-1024, CCL-2088 or CCL-3301.</small></div><div class="state-time">Demo</div></div>`;
    return;
  }
  const icon = data.status === 'Delivered' ? '✓' : data.status === 'Out for Delivery' ? '↗' : '⌁';
  trackingResult.innerHTML = `
    <div class="track-state">
      <div class="state-badge">${icon}</div>
      <div><strong>${data.status}</strong><small>${data.location} · ${data.temp} · Target ${data.target}</small></div>
      <div class="state-time">${data.updated}</div>
    </div>
    <div class="progress" aria-label="Shipment progress"><span style="width:${data.progress}%"></span></div>`;
}
trackingForm?.addEventListener('submit', (event) => { event.preventDefault(); renderTracking(trackingId.value); });
sampleButtons.forEach(btn => btn.addEventListener('click', () => { trackingId.value = btn.dataset.sample; renderTracking(btn.dataset.sample); }));

const quoteForm = document.getElementById('quoteForm');
const estimate = document.getElementById('estimate');
const quoteStatus = document.getElementById('quoteStatus');
const inputs = ['origin','destination','temperature','weight','serviceType'].map(id => document.getElementById(id));

function calcEstimate() {
  const weight = Number(document.getElementById('weight').value || 0);
  const temp = document.getElementById('temperature').value;
  const service = document.getElementById('serviceType').value;
  const base = service === 'storage' ? 2600 : service === 'integrated' ? 6200 : service === 'custom' ? 4800 : 4200;
  const tempFactor = temp === 'frozen' ? 1.22 : temp === 'ambient' ? 0.88 : temp === 'custom' ? 1.12 : 1;
  const weightBand = weight <= 250 ? 0.88 : weight <= 500 ? 1 : weight <= 1000 ? 1.28 : 1.62;
  const estimated = weight > 0 ? Math.round(base * tempFactor * weightBand) : 0;
  estimate.textContent = estimated ? `₹${estimated.toLocaleString('en-IN')}` : '₹0';
  return estimated;
}
inputs.forEach(el => el?.addEventListener('input', calcEstimate));
inputs.forEach(el => el?.addEventListener('change', calcEstimate));
let lastQuote = null;

function makeQuoteNumber() {
  const now = new Date();
  const stamp = String(now.getFullYear()).slice(-2) + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(100 + Math.random() * 900);
  return `BCL-QTN-${stamp}-${rand}`;
}

function serviceLabel(value) {
  return ({
    transport: 'Reefer transport',
    storage: 'Cold storage',
    integrated: 'Transport + storage',
    custom: 'Custom cold-chain solution'
  })[value] || 'Cold-chain logistics service';
}

function temperatureLabel(value) {
  return ({
    chilled: 'Chilled (2°C to 8°C)',
    frozen: 'Frozen (-18°C or below)',
    ambient: 'Controlled ambient',
    custom: 'Custom temperature range'
  })[value] || 'Temperature controlled';
}

function preparePrintableQuote() {
  const name = document.getElementById('customerName').value.trim();
  const company = document.getElementById('companyName').value.trim() || '—';
  const origin = document.getElementById('origin').value.trim();
  const destination = document.getElementById('destination').value.trim();
  const temp = document.getElementById('temperature').value;
  const weight = Number(document.getElementById('weight').value || 0);
  const service = document.getElementById('serviceType').value;
  const email = document.getElementById('quoteEmail').value.trim();
  const total = calcEstimate();
  if (!name || !origin || !destination || !weight || !email) return;

  lastQuote = {
    number: makeQuoteNumber(),
    date: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
    name, company, origin, destination, temp, weight, service, email, total
  };

  document.getElementById('printQuoteNo').textContent = lastQuote.number;
  document.getElementById('printQuoteDate').textContent = lastQuote.date;
  document.getElementById('printCustomer').textContent = name;
  document.getElementById('printCompany').textContent = company;
  document.getElementById('printEmail').textContent = email;
  document.getElementById('printRoute').textContent = `${origin} → ${destination}`;
  document.getElementById('printService').textContent = serviceLabel(service);
  document.getElementById('printTemperature').textContent = temperatureLabel(temp);
  document.getElementById('printWeight').textContent = `${weight.toLocaleString('en-IN')} kg`;
  document.getElementById('printDescription').textContent = `${serviceLabel(service)} · ${temperatureLabel(temp)}`;
  document.getElementById('printAmount').textContent = `₹${total.toLocaleString('en-IN')}`;
  document.getElementById('printTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
  document.getElementById('printQuote').setAttribute('aria-hidden', 'false');
  document.getElementById('printQuoteBtn').disabled = false;
}

quoteForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('customerName').value.trim();
  const origin = document.getElementById('origin').value.trim();
  const destination = document.getElementById('destination').value.trim();
  const total = calcEstimate();
  preparePrintableQuote();
  quoteStatus.textContent = `Thanks ${name}. Your quote request for ${origin} to ${destination} is prepared with an indicative value of ₹${total.toLocaleString('en-IN')}. You can now print/save the quotation as a PDF or contact +91 70701 29013 / baijuksingh@gmail.com for final pricing.`;
});

document.getElementById('printQuoteBtn')?.addEventListener('click', () => {
  if (!lastQuote) preparePrintableQuote();
  if (lastQuote) window.print();
});

const trendLine = document.getElementById('trendLine');
const trendDots = document.getElementById('trendDots');
const chartLabels = document.getElementById('chartLabels');
const trendSets = {
  6: { points: '60,190 190,160 320,180 450,105 580,125 710,70', labels: ['May','Jun','Jul','Aug','Sep','Oct'] },
  4: { points: '160,160 360,180 560,105 760,70', labels: ['Jul','Aug','Sep','Oct'] }
};
function updateChart(range) {
  const set = trendSets[range];
  trendLine.setAttribute('points', set.points);
  trendDots.innerHTML = set.points.split(' ').map((point) => { const [x,y] = point.split(','); return `<circle cx="${x}" cy="${y}" r="5" fill="currentColor" />`; }).join('');
  chartLabels.innerHTML = set.labels.map(label => `<span>${label}</span>`).join('');
  chartLabels.style.gridTemplateColumns = `repeat(${set.labels.length},1fr)`;
}
updateChart(6);
document.getElementById('chartRange')?.addEventListener('change', (event) => updateChart(Number(event.target.value)));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
menuBtn?.addEventListener('click', () => { const open = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', String(open)); });
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menuBtn?.setAttribute('aria-expanded','false'); }));
