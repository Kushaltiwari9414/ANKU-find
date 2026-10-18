const fallbackProducts = [
  { id: 1, name: 'Blue pottery diya set', seller: 'Mitti Studio', category: 'Crafts', city: 'Jaipur', area: 'Kishanpole', price: 420, emoji: '🏺', color: 'blue', badge: 'Local favourite' },
  { id: 2, name: 'Ghar ka lunch · 5 meals', seller: 'Maa Ki Rasoi', category: 'Food', city: 'Jaipur', area: 'Mansarovar', price: 650, emoji: '🍱', color: 'orange', badge: 'Fresh today' },
  { id: 3, name: 'Hand-block print tote', seller: 'Rangrez Jaipur', category: 'Fashion', city: 'Jaipur', area: 'Sanganer', price: 780, emoji: '👜', color: 'pink', badge: 'Made nearby' },
  { id: 4, name: 'Mini jade plant + pot', seller: 'The Green Baithak', category: 'Home', city: 'Jaipur', area: 'C-Scheme', price: 299, emoji: '🪴', color: 'lavender', badge: 'Easy pickup' },
  { id: 5, name: 'Masala chai concentrate', seller: 'Chai Wali Gali', category: 'Food', city: 'Jaipur', area: 'Vaishali Nagar', price: 240, emoji: '🫖', color: 'orange', badge: 'Small batch' },
  { id: 6, name: 'Leheriya scrunchie set', seller: 'Gota Girls', category: 'Fashion', city: 'Jaipur', area: 'Bapu Bazaar', price: 180, emoji: '🎀', color: 'pink', badge: 'Giftable' },
  { id: 7, name: 'Hand-painted bookmark', seller: 'Kagaz Katha', category: 'Crafts', city: 'Jaipur', area: 'Jawahar Nagar', price: 120, emoji: '🪷', color: 'blue', badge: 'Under ₹200' },
  { id: 8, name: 'Cushion cover · 2 pack', seller: 'Gulabi Ghar', category: 'Home', city: 'Jaipur', area: 'Malviya Nagar', price: 560, emoji: '🧵', color: 'lavender', badge: 'New' },
  { id: 9, name: 'Handwoven desk basket', seller: 'Nayi Dilli Collective', category: 'Home', city: 'Delhi', area: 'Saket', price: 690, emoji: '🧺', color: 'orange', badge: 'City pick' },
  { id: 10, name: 'Filter coffee starter kit', seller: 'Bandra Bean Co.', category: 'Food', city: 'Mumbai', area: 'Bandra', price: 520, emoji: '☕', color: 'blue', badge: 'Small batch' },
  { id: 11, name: 'Terracotta planter pair', seller: 'Green Commons', category: 'Home', city: 'Bengaluru', area: 'Indiranagar', price: 480, emoji: '🌱', color: 'pink', badge: 'Easy pickup' },
  { id: 12, name: 'Indigo notebook set', seller: 'Paper & Thread', category: 'Crafts', city: 'Delhi', area: 'Hauz Khas', price: 310, emoji: '📓', color: 'lavender', badge: 'Giftable' }
];
const fallbackJobs = [
  { id: 101, title: 'Weekend counter helper', company: 'Mitti Studio', type: 'Retail', city: 'Jaipur', area: 'Kishanpole', schedule: 'Sat–Sun · 11am–5pm', pay: '₹500 / day', icon: '🏺', description: 'Help welcome customers and pack pottery orders.' },
  { id: 102, title: 'Evening tiffin delivery partner', company: 'Maa Ki Rasoi', type: 'Delivery', city: 'Jaipur', area: 'Mansarovar', schedule: 'Mon–Fri · 6pm–9pm', pay: '₹250 / shift', icon: '🛵', description: 'Deliver dinner boxes to nearby homes by cycle or scooter.' },
  { id: 103, title: 'Social media photo assistant', company: 'Rangrez Jaipur', type: 'Creative', city: 'Jaipur', area: 'Sanganer', schedule: 'Flexible · 4 hrs / week', pay: '₹1,500 / week', icon: '📸', description: 'Capture simple product photos and write short captions.' },
  { id: 104, title: 'Maths tutor for class 6', company: 'Neighbourhood family', type: 'Teaching', city: 'Jaipur', area: 'Vaishali Nagar', schedule: 'Tue–Thu · 5pm–7pm', pay: '₹300 / hour', icon: '✏️', description: 'Support homework and build confidence with weekly practice.' },
  { id: 105, title: 'Saturday market sales helper', company: 'Gota Girls', type: 'Retail', city: 'Jaipur', area: 'C-Scheme', schedule: 'Sat · 10am–4pm', pay: '₹600 / day', icon: '🛍️', description: 'Set up a pop-up stall and help shoppers choose gifts.' },
  { id: 106, title: 'Cafe service teammate', company: 'Nayi Dilli Collective', type: 'Food', city: 'Delhi', area: 'Saket', schedule: 'Mon–Fri · 4pm–8pm', pay: '₹450 / shift', icon: '☕', description: 'Support counter service and keep the cafe welcoming.' },
  { id: 107, title: 'Weekend event runner', company: 'Bandra Bean Co.', type: 'Creative', city: 'Mumbai', area: 'Bandra', schedule: 'Sat–Sun · flexible', pay: '₹700 / day', icon: '🎪', description: 'Help a small brand set up and pack down neighbourhood events.' },
  { id: 108, title: 'After-school coding buddy', company: 'Green Commons', type: 'Teaching', city: 'Bengaluru', area: 'Indiranagar', schedule: 'Tue–Thu · 5pm–7pm', pay: '₹500 / hour', icon: '💻', description: 'Help young learners practise beginner-friendly coding projects.' }
];

const STORAGE_KEYS = { cart: 'anku-find-cart', location: 'anku-find-location', offlineJobs: 'anku-find-offline-jobs' };
const locations = ['Any', 'Jaipur', 'Delhi', 'Mumbai', 'Bengaluru'];
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const state = { view: 'home', products: [...fallbackProducts], jobs: [...fallbackJobs], cart: [], location: 'Any', sortProducts: false, pendingPhoto: '', offline: false, offlineOtp: false, requestedMobile: '' };

function readStorage(key, fallback) { try { const value = window.localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); } catch (_) { return fallback; } }
function writeStorage(key, value) { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (_) { showToast('This browser could not save the latest change'); } }
function normalizedMobile(value) { return String(value || '').replace(/\D/g, '').slice(0, 10); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }
function showToast(message) { const toast = $('#toast'); if (!toast) return; toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600); }
function setFieldError(id, message) { const field = $(`#${id}`); const error = $(`#${id.replace('number', 'error').replace('code', 'error')}`); if (field) field.setAttribute('aria-invalid', message ? 'true' : 'false'); if (error) { error.textContent = message; error.hidden = !message; } }
function setAuthNotice(text, visible = true, kind = 'dev') { const notice = $('#dev-otp-notice'); if (!notice) return; notice.textContent = text; notice.hidden = !visible; notice.dataset.kind = kind; }
function showAuthStep(step) { $('#login-step').hidden = step !== 'login'; $('#otp-step').hidden = step !== 'otp'; (step === 'login' ? $('#mobile-number') : $('#otp-code')).focus(); }
function revealApp() { $('#auth-screen').hidden = true; $('#app-shell').hidden = false; const initialView = window.location.hash.slice(1); setView(['home', 'shop', 'jobs'].includes(initialView) ? initialView : 'home'); }
function markOffline() { if (!state.offline) showToast('Local server unavailable — using clearly labelled offline fallback'); state.offline = true; $('#connection-status')?.replaceChildren(document.createTextNode('Offline fallback')); }
function isUnavailable(error) { return error && error.name === 'ApiUnavailable'; }

async function api(path, options = {}) {
  let response;
  try { response = await fetch(path, { credentials: 'same-origin', ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) } }); }
  catch (_) { const error = new Error('API unavailable'); error.name = 'ApiUnavailable'; throw error; }
  let body = {}; try { body = await response.json(); } catch (_) { /* Empty response bodies are allowed for no-content responses. */ }
  if (!response.ok) { const error = new Error(body.error || `Request failed (${response.status})`); error.status = response.status; throw error; }
  return body;
}

async function handleLogin(event) {
  event.preventDefault(); const mobile = normalizedMobile($('#mobile-number').value); $('#mobile-number').value = mobile;
  if (!/^[6-9]\d{9}$/.test(mobile)) { setFieldError('mobile-number', 'Enter a valid 10-digit Indian mobile number.'); $('#mobile-number').focus(); return; }
  setFieldError('mobile-number', ''); $('#resend-status').textContent = 'Requesting a code…';
  try {
    const channel = $('input[name="channel"]:checked')?.value || 'whatsapp';
    const result = await api('/api/auth/request-otp', { method: 'POST', body: JSON.stringify({ mobile, channel }) });
    state.requestedMobile = mobile; state.offlineOtp = false; setAuthNotice(result.devMode && result.devOtp ? `Development server OTP: ${result.devOtp}` : '', Boolean(result.devMode && result.devOtp));
    $('#otp-code').value = ''; $('#resend-status').textContent = result.message || (result.smsSent ? 'Code sent to your phone.' : 'Development mode: no SMS was sent.'); showAuthStep('otp');
  } catch (error) {
    if (!isUnavailable(error)) { setFieldError('mobile-number', error.message); $('#resend-status').textContent = ''; return; }
    markOffline(); state.requestedMobile = mobile; state.offlineOtp = true; setAuthNotice('', false); $('#otp-code').value = ''; $('#resend-status').textContent = 'Offline fallback active. No SMS was sent.'; showAuthStep('otp');
  }
}

async function handleOtp(event) {
  event.preventDefault(); const mobile = state.requestedMobile || normalizedMobile($('#mobile-number').value); const otp = normalizedMobile($('#otp-code').value); $('#otp-code').value = otp;
  if (!/^\d{4,8}$/.test(otp)) { setFieldError('otp-code', 'Enter your verification code.'); return; }
  try { await api('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ mobile, otp }) }); setFieldError('otp-code', ''); revealApp(); showToast('Verified with the connected local server'); }
  catch (error) {
    if (isUnavailable(error) && state.offlineOtp && otp === '123456') { setFieldError('otp-code', ''); revealApp(); showToast('Offline fallback session active'); return; }
    setFieldError('otp-code', isUnavailable(error) ? 'The local server is unavailable. Use the labelled offline fallback code.' : error.message); $('#otp-code').focus();
  }
}

async function logout() {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch (error) { if (!isUnavailable(error)) showToast(error.message); }
  closeModals(); $('#app-shell').hidden = true; $('#auth-screen').hidden = false; $('#mobile-number').value = ''; $('#otp-code').value = ''; state.requestedMobile = ''; state.offlineOtp = false; setAuthNotice('', false); setFieldError('mobile-number', ''); setFieldError('otp-code', ''); showAuthStep('login'); window.history.replaceState(null, '', window.location.pathname);
}

function setView(view) { state.view = view; closeModals(); $$('.view').forEach((section) => { const active = section.id === `${view}-view`; section.hidden = !active; section.classList.toggle('active-view', active); }); $$('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.viewLink === view)); window.history.replaceState(null, '', `#${view}`); $('.site-header').classList.remove('menu-open'); $('[data-toggle-menu]').setAttribute('aria-expanded', 'false'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function locationMatches(item) { return state.location === 'Any' || item.city === state.location || item.city === 'Any'; }
function renderProducts() {
  const query = $('#product-search').value.trim().toLowerCase(); const category = $('#product-category').value;
  let filtered = state.products.filter((product) => { const searchable = `${product.name} ${product.seller} ${product.area} ${product.city} ${product.category}`.toLowerCase(); return locationMatches(product) && (!query || searchable.includes(query)) && (category === 'All' || product.category === category); });
  if (state.sortProducts) filtered = [...filtered].sort((a, b) => a.price - b.price);
  $('#product-results-count').textContent = `Showing ${filtered.length} ${filtered.length === 1 ? 'product' : 'products'} · ${state.location === 'Any' ? 'all locations' : state.location}`;
  $('#product-grid').innerHTML = filtered.map((product) => `<article class="product-card"><div class="product-image ${escapeHtml(product.color)}"><span class="product-badge">${escapeHtml(product.badge)}</span><span aria-hidden="true">${escapeHtml(product.emoji)}</span></div><div class="product-info"><h3>${escapeHtml(product.name)}</h3><p class="seller">${escapeHtml(product.seller)} · ${escapeHtml(product.area)}, ${escapeHtml(product.city)}</p><div class="product-bottom"><span class="product-price">₹${Number(product.price).toLocaleString('en-IN')}</span><button class="add-button" type="button" data-add-product="${product.id}" aria-label="Add ${escapeHtml(product.name)} to bag">＋</button></div></div></article>`).join(''); $('#product-empty').hidden = filtered.length !== 0;
}
function renderJobs() {
  const query = $('#job-search').value.trim().toLowerCase(); const type = $('#job-type').value; const area = $('#job-area').value;
  const filtered = state.jobs.filter((job) => { const searchable = `${job.title} ${job.company} ${job.area} ${job.city} ${job.type} ${job.description}`.toLowerCase(); return locationMatches(job) && (!query || searchable.includes(query)) && (type === 'All' || job.type === type) && (area === 'All' || job.area === area); });
  $('#job-results-count').textContent = `Showing ${filtered.length} ${filtered.length === 1 ? 'role' : 'roles'} · ${state.location === 'Any' ? 'all locations' : state.location}`;
  $('#job-list').innerHTML = filtered.map((job) => { const source = job.userAdded ? 'LOCAL API listing' : 'CONNECTED listing'; const photo = job.photo && (job.photo.startsWith('/uploads/') || job.photo.startsWith('data:image/')) ? `<img class="job-photo" src="${escapeHtml(job.photo)}" alt="Photo for ${escapeHtml(job.title)}" />` : `<span class="job-icon" aria-hidden="true">${escapeHtml(job.icon || '📌')}</span>`; return `<article class="job-card"><div class="job-main">${photo}<div><h3>${escapeHtml(job.title)}</h3><p class="job-company">${escapeHtml(job.company)} · ${source}</p><div class="job-meta"><span>⌖ ${escapeHtml(job.area)}, ${escapeHtml(job.city === 'Any' ? 'Any location' : job.city)}</span><span>◷ ${escapeHtml(job.schedule)}</span><span>${escapeHtml(job.type)}</span></div><p class="job-description">${escapeHtml(job.description)}</p></div></div><div class="job-side"><span class="job-pay">${escapeHtml(job.pay)}<small>${job.userAdded ? 'employer supplied' : 'listing data'}</small></span><button class="job-apply" type="button" data-apply-job="${job.id}">I'm interested →</button></div></article>`; }).join(''); $('#job-empty').hidden = filtered.length !== 0;
}
function updateCart() { writeStorage(STORAGE_KEYS.cart, state.cart); $('#cart-count').textContent = state.cart.length; $('#cart-empty').hidden = state.cart.length !== 0; $('#cart-total').hidden = state.cart.length === 0; $('#cart-items').innerHTML = state.cart.map((product) => `<div class="cart-item"><span class="cart-item-emoji" aria-hidden="true">${escapeHtml(product.emoji)}</span><div class="cart-item-info"><strong>${escapeHtml(product.name)}</strong><small>₹${Number(product.price).toLocaleString('en-IN')}</small></div><button type="button" data-remove-product="${product.id}">Remove</button></div>`).join(''); $('#cart-total strong span').textContent = state.cart.reduce((sum, item) => sum + Number(item.price || 0), 0).toLocaleString('en-IN'); }
function updateLocation(nextLocation, announce = true) { state.location = locations.includes(nextLocation) ? nextLocation : 'Any'; $('#global-location').value = state.location; $('#job-form-location').textContent = state.location === 'Any' ? 'Any location' : state.location; writeStorage(STORAGE_KEYS.location, state.location); renderProducts(); renderJobs(); if (announce) showToast(`Showing ${state.location === 'Any' ? 'all locations' : state.location}`); }
function openModal(id) { $(`#${id}`).hidden = false; const focusTarget = id === 'assistant-modal' ? $('#assistant-input') : $(`#${id} input`); setTimeout(() => focusTarget?.focus(), 30); }
function closeModals() { $$('.modal-backdrop').forEach((modal) => { modal.hidden = true; }); }
function assistantReply(question) { const lower = question.toLowerCase(); const place = state.location === 'Any' ? 'any location' : state.location; if (lower.includes('work') || lower.includes('job') || lower.includes('shift')) return `Try the “Find work” view — there are roles for retail, delivery, teaching, and creative work in ${place}.`; if (lower.includes('food') || lower.includes('tiffin') || lower.includes('eat')) return `For a local meal in ${place}, browse the Food & drink category.`; if (lower.includes('gift') || lower.includes('pottery') || lower.includes('craft')) return `Browse Crafts for a thoughtful local gift in ${place}.`; return `I can help you start with local shops or flexible work in ${place}. Try “gift under ₹1,000” or “weekend work”.`; }
function addAssistantMessage(text, isUser = false) { const message = document.createElement('div'); message.className = `assistant-bubble${isUser ? ' user' : ''}`; message.textContent = text; $('#assistant-messages').append(message); $('#assistant-messages').scrollTop = $('#assistant-messages').scrollHeight; }
function resizePhoto(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error('Could not read this image')); reader.onload = () => { const image = new Image(); image.onerror = () => reject(new Error('Could not process this image')); image.onload = () => { const max = 1000; const scale = Math.min(1, max / Math.max(image.naturalWidth, image.naturalHeight)); const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale)); canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', 0.78)); }; image.src = reader.result; }; reader.readAsDataURL(file); }); }
function resetPhoto() { state.pendingPhoto = ''; $('#job-photo').value = ''; $('#job-photo-preview').hidden = true; $('#job-photo-preview img').removeAttribute('src'); }

document.addEventListener('click', async (event) => {
  const viewLink = event.target.closest('[data-view-link]'); if (viewLink) { event.preventDefault(); const category = viewLink.dataset.category; if (category) { $('#product-category').value = category; renderProducts(); } setView(viewLink.dataset.viewLink); return; }
  const addButton = event.target.closest('[data-add-product]'); if (addButton) { const product = state.products.find((item) => item.id === Number(addButton.dataset.addProduct)); if (product) { state.cart.push(product); updateCart(); showToast(`${product.name} added to your bag`); } return; }
  const removeButton = event.target.closest('[data-remove-product]'); if (removeButton) { state.cart = state.cart.filter((item) => item.id !== Number(removeButton.dataset.removeProduct)); updateCart(); return; }
  const applyButton = event.target.closest('[data-apply-job]'); if (applyButton) { try { const result = await api(`/api/jobs/${applyButton.dataset.applyJob}/interest`, { method: 'POST', body: '{}' }); showToast(`Interest noted — ${result.interestCount || 0} interested`); } catch (error) { if (isUnavailable(error)) { markOffline(); showToast('Interest noted in the offline fallback'); } else showToast(error.message); } return; }
  if (event.target.closest('[data-open-assistant]')) { openModal('assistant-modal'); return; } if (event.target.closest('[data-open-job-form]')) { updateLocation(state.location, false); openModal('job-modal'); return; } if (event.target.closest('[data-open-cart]')) { updateCart(); openModal('cart-modal'); return; } if (event.target.closest('[data-logout]')) { logout(); return; } if (event.target.closest('[data-close-modal]') || event.target.classList.contains('modal-backdrop')) { closeModals(); return; } if (event.target.closest('[data-remove-photo]')) { resetPhoto(); return; } const prompt = event.target.closest('[data-prompt]'); if (prompt) { $('#assistant-input').value = prompt.dataset.prompt; $('#assistant-form').requestSubmit(); return; } if (event.target.closest('[data-clear-products]')) { $('#product-search').value = ''; $('#product-category').value = 'All'; renderProducts(); return; } if (event.target.closest('[data-clear-jobs]')) { $('#job-search').value = ''; $('#job-type').value = 'All'; $('#job-area').value = 'All'; renderJobs(); }
});

$('#login-form').addEventListener('submit', handleLogin); $('#otp-form').addEventListener('submit', handleOtp); $('[data-auth-back]').addEventListener('click', () => { setFieldError('otp-code', ''); showAuthStep('login'); }); $('[data-auth-resend]').addEventListener('click', () => { $('#login-form').requestSubmit(); }); $('#mobile-number').addEventListener('input', (event) => { event.target.value = normalizedMobile(event.target.value); setFieldError('mobile-number', ''); }); $('#otp-code').addEventListener('input', (event) => { event.target.value = normalizedMobile(event.target.value); setFieldError('otp-code', ''); });
$('#global-location').addEventListener('change', (event) => updateLocation(event.target.value)); $('#product-search').addEventListener('input', renderProducts); $('#product-category').addEventListener('change', renderProducts); $('#job-search').addEventListener('input', renderJobs); $('#job-type').addEventListener('change', renderJobs); $('#job-area').addEventListener('change', renderJobs); $('[data-sort-products]').addEventListener('click', (event) => { state.sortProducts = !state.sortProducts; event.currentTarget.setAttribute('aria-pressed', String(state.sortProducts)); event.currentTarget.firstChild.textContent = state.sortProducts ? 'Sort: price ' : 'Sort: featured '; renderProducts(); }); $('[data-toggle-menu]').addEventListener('click', (event) => { const header = $('.site-header'); const open = header.classList.toggle('menu-open'); event.currentTarget.setAttribute('aria-expanded', String(open)); });
$('#assistant-form').addEventListener('submit', (event) => { event.preventDefault(); const input = $('#assistant-input'); const question = input.value.trim(); if (!question) return; addAssistantMessage(question, true); input.value = ''; setTimeout(() => addAssistantMessage(assistantReply(question)), 280); }); $('#job-photo').addEventListener('change', async (event) => { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith('image/')) { showToast('Please choose an image file'); resetPhoto(); return; } try { state.pendingPhoto = await resizePhoto(file); $('#job-photo-preview img').src = state.pendingPhoto; $('#job-photo-preview').hidden = false; } catch (_) { resetPhoto(); showToast('This image could not be processed'); } });

$('#job-form').addEventListener('submit', async (event) => {
  event.preventDefault(); const formElement = event.currentTarget; const contact = normalizedMobile(formElement.elements.contact.value); formElement.elements.contact.value = contact; if (!formElement.checkValidity()) { formElement.reportValidity(); return; } if (!/^[6-9]\d{9}$/.test(contact)) { formElement.elements.contact.setCustomValidity('Enter a valid 10-digit Indian mobile number.'); formElement.reportValidity(); formElement.elements.contact.setCustomValidity(''); return; }
  const form = new FormData(formElement); const payload = { title: String(form.get('title')).trim(), company: String(form.get('company')).trim(), area: String(form.get('area')).trim(), type: String(form.get('type')), city: state.location === 'Any' ? 'Any' : state.location, pay: String(form.get('pay')).trim(), contact, description: String(form.get('description')).trim(), photo: state.pendingPhoto };
  try { const result = await api('/api/jobs', { method: 'POST', body: JSON.stringify(payload) }); state.jobs = [result.job, ...state.jobs.filter((job) => job.id !== result.job.id)]; showToast('Your listing is saved to the local API'); }
  catch (error) { if (!isUnavailable(error)) { showToast(error.message); return; } markOffline(); const offlineJob = { ...payload, id: Date.now(), schedule: 'Flexible · set by employer', icon: '📌', userAdded: true, photo: state.pendingPhoto }; state.jobs = [offlineJob, ...state.jobs]; writeStorage(STORAGE_KEYS.offlineJobs, state.jobs.filter((job) => job.userAdded)); showToast('Saved in the labelled offline fallback'); }
  formElement.reset(); resetPhoto(); closeModals(); setView('jobs'); renderJobs();
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModals(); });

async function loadData() {
  try { const result = await api('/api/products'); state.products = Array.isArray(result.products) ? result.products : fallbackProducts; renderProducts(); } catch (error) { if (isUnavailable(error)) markOffline(); else showToast(error.message); }
  try { const result = await api('/api/jobs'); state.jobs = Array.isArray(result.jobs) ? result.jobs : fallbackJobs; renderJobs(); } catch (error) { if (isUnavailable(error)) { markOffline(); const localJobs = readStorage(STORAGE_KEYS.offlineJobs, []); state.jobs = [...fallbackJobs, ...(Array.isArray(localJobs) ? localJobs : [])]; renderJobs(); } else showToast(error.message); }
}
function syncConnectedCopy() {
  const modal = $('#job-modal');
  if (!modal) return;
  const intro = modal.querySelector('.modal-intro');
  const notice = modal.querySelector('.form-notice span');
  const note = modal.querySelector('.form-note');
  if (intro) intro.textContent = 'Add a role to the connected local API. The server saves the listing and optional compressed photo in this project.';
  if (notice) notice.textContent = 'Required details are stored by the server. Check that your contact, location, and pay information is accurate before saving.';
  if (note) note.textContent = 'Saved through the connected local API · Photos are stored in the server uploads folder · Verify all contact, location, and pay details before relying on a listing.';
  const kicker = modal.querySelector('.modal-kicker');
  if (kicker) kicker.textContent = 'For local businesses · Connected API';
}
async function boot() {
  syncConnectedCopy(); state.cart = Array.isArray(readStorage(STORAGE_KEYS.cart, [])) ? readStorage(STORAGE_KEYS.cart, []) : []; const savedLocation = readStorage(STORAGE_KEYS.location, 'Any'); state.location = locations.includes(savedLocation) ? savedLocation : 'Any'; $('#global-location').value = state.location; $('#mobile-number').value = '';
  renderProducts(); renderJobs(); updateCart(); updateLocation(state.location, false);
  const jobAreaInput = $('#job-form [name="area"]'); const jobTypeInput = $('#job-form [name="type"]'); if (jobAreaInput) { jobAreaInput.id = 'job-location-input'; jobAreaInput.closest('label')?.setAttribute('for', 'job-location-input'); } if (jobTypeInput) jobTypeInput.closest('label')?.setAttribute('for', 'job-type-form');
  try { const session = await api('/api/session'); if (session.authenticated) revealApp(); else { $('#app-shell').hidden = true; $('#auth-screen').hidden = false; showAuthStep('login'); } await loadData(); }
  catch (error) { if (isUnavailable(error)) markOffline(); $('#app-shell').hidden = true; $('#auth-screen').hidden = false; showAuthStep('login'); }
}
boot();
