// Rifa Navideña 2026 - Control Lógico Principal
document.addEventListener('DOMContentLoaded', () => {
  // Configuración General
  const TICKET_PRICE = 300;
  const WHATSAPP_PRIMARY = '18492437510';
  const WHATSAPP_SECONDARY = '16466687510';
  const RAFFLE_DATE = new Date('2026-12-20T20:00:00-04:00').getTime();

  // Elementos DOM
  const countdownDays = document.getElementById('count-days');
  const countdownHours = document.getElementById('count-hours');
  const countdownMinutes = document.getElementById('count-minutes');
  const countdownSeconds = document.getElementById('count-seconds');

  const stepperInput = document.getElementById('ticket-stepper-input');
  const stepperMinus = document.getElementById('stepper-minus');
  const stepperPlus = document.getElementById('stepper-plus');
  const packButtons = document.querySelectorAll('.pack-button');
  const summaryQty = document.getElementById('summary-qty');
  const summaryTotal = document.getElementById('summary-total');
  const ticketsListContainer = document.getElementById('tickets-list-container');
  const btnShuffle = document.getElementById('btn-shuffle-lucky');
  const btnWhatsAppBuy = document.getElementById('btn-whatsapp-buy');
  const stickyWhatsAppBtn = document.getElementById('sticky-whatsapp-btn');
  const stickyPriceDisplay = document.getElementById('sticky-price-display');

  // Estado
  let currentQty = 3;
  let luckyNumbers = [];

  // 1. Cronómetro de Cuenta Regresiva
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = RAFFLE_DATE - now;

    if (distance <= 0) {
      if (countdownDays) countdownDays.innerText = '00';
      if (countdownHours) countdownHours.innerText = '00';
      if (countdownMinutes) countdownMinutes.innerText = '00';
      if (countdownSeconds) countdownSeconds.innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (countdownDays) countdownDays.innerText = String(days).padStart(2, '0');
    if (countdownHours) countdownHours.innerText = String(hours).padStart(2, '0');
    if (countdownMinutes) countdownMinutes.innerText = String(minutes).padStart(2, '0');
    if (countdownSeconds) countdownSeconds.innerText = String(seconds).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // 2. Generador de Folios / Números
  function generateLuckyNumbers(count) {
    const list = [];
    const used = new Set();
    while (list.length < count) {
      const num = Math.floor(1000 + Math.random() * 9000);
      if (!used.has(num)) {
        used.add(num);
        list.push(num);
      }
    }
    return list;
  }

  function renderLuckyNumbers() {
    if (!ticketsListContainer) return;
    ticketsListContainer.innerHTML = '';
    luckyNumbers.forEach((num) => {
      const pill = document.createElement('div');
      pill.className = 'ticket-pill';
      pill.innerHTML = `<span class="pill-dot"></span> Folio #${num}`;
      ticketsListContainer.appendChild(pill);
    });
  }

  // 3. Actualización de Pedido y Enlace a WhatsApp (Sobrio y Profesional)
  function updateOrder(qty) {
    currentQty = Math.max(1, Math.min(100, parseInt(qty) || 1));
    if (stepperInput) stepperInput.value = currentQty;

    const total = currentQty * TICKET_PRICE;
    const formattedTotal = total.toLocaleString('es-DO');

    if (summaryQty) summaryQty.innerText = currentQty;
    if (summaryTotal) summaryTotal.innerText = `RD$ ${formattedTotal}`;
    if (stickyPriceDisplay) stickyPriceDisplay.innerText = `RD$ ${formattedTotal}`;

    // Sincronizar botones de paquetes
    packButtons.forEach(btn => {
      const btnQty = parseInt(btn.getAttribute('data-qty'));
      if (btnQty === currentQty) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Actualizar folios
    luckyNumbers = generateLuckyNumbers(currentQty);
    renderLuckyNumbers();

    // Mensaje formal para WhatsApp sin emojis
    const numbersSample = luckyNumbers.slice(0, 5).map(n => `#${n}`).join(', ') + (luckyNumbers.length > 5 ? ' entre otros' : '');
    const message = `Saludos cordiales a la administración de dtc & co.%0A%0AHe seleccionado boletos para la Rifa Navideña 2026.%0A%0ACantidad: ${currentQty} boleto(s)%0AMonto total: RD$ ${formattedTotal}%0AFolios preseleccionados: ${numbersSample}%0A%0ASolicito los números de cuenta bancaria para realizar la transferencia correspondiente. Quedo a la espera de su confirmación. Muchas gracias.`;

    const waLink = `https://wa.me/${WHATSAPP_PRIMARY}?text=${message}`;

    if (btnWhatsAppBuy) btnWhatsAppBuy.setAttribute('href', waLink);
    if (stickyWhatsAppBtn) stickyWhatsAppBtn.setAttribute('href', waLink);
  }

  // Eventos de Stepper
  if (stepperMinus) {
    stepperMinus.addEventListener('click', () => updateOrder(currentQty - 1));
  }
  if (stepperPlus) {
    stepperPlus.addEventListener('click', () => updateOrder(currentQty + 1));
  }
  if (stepperInput) {
    stepperInput.addEventListener('change', (e) => updateOrder(e.target.value));
  }

  // Selección de paquetes
  packButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const qty = parseInt(btn.getAttribute('data-qty'));
      updateOrder(qty);
    });
  });

  // Regenerar folios
  if (btnShuffle) {
    btnShuffle.addEventListener('click', () => {
      luckyNumbers = generateLuckyNumbers(currentQty);
      renderLuckyNumbers();
    });
  }

  // Inicialización
  updateOrder(currentQty);

  // 4. Acordeón de Preguntas Frecuentes
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(other => other.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // 5. Modal de Términos y Condiciones
  const modalOverlay = document.getElementById('modal-terms');
  const modalOpenBtns = document.querySelectorAll('.open-terms-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  modalOpenBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalOverlay) modalOverlay.classList.add('active');
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      if (modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }
});
