// Rifa Navideña 2026 - Control Lógico y Pasarela de Pago en Línea
document.addEventListener('DOMContentLoaded', () => {
  // Configuración General
  const TICKET_PRICE = 300;
  const WHATSAPP_PRIMARY = '18492437510';
  const RAFFLE_DATE = new Date('2026-12-20T20:00:00-04:00').getTime();

  // Elementos DOM - Contador
  const countdownDays = document.getElementById('count-days');
  const countdownHours = document.getElementById('count-hours');
  const countdownMinutes = document.getElementById('count-minutes');
  const countdownSeconds = document.getElementById('count-seconds');

  // Elementos DOM - Selector de Boletos
  const stepperInput = document.getElementById('ticket-stepper-input');
  const stepperMinus = document.getElementById('stepper-minus');
  const stepperPlus = document.getElementById('stepper-plus');
  const packButtons = document.querySelectorAll('.pack-button');
  const summaryQty = document.getElementById('summary-qty');
  const summaryTotal = document.getElementById('summary-total');
  const ticketsListContainer = document.getElementById('tickets-list-container');
  const btnShuffle = document.getElementById('btn-shuffle-lucky');
  const stickyPriceDisplay = document.getElementById('sticky-price-display');

  // Elementos DOM - Checkout Modal
  const modalCheckout = document.getElementById('modal-checkout');
  const btnOpenCheckout = document.getElementById('btn-open-checkout');
  const stickyCheckoutBtn = document.getElementById('sticky-checkout-btn');
  const heroTicketBtn = document.getElementById('hero-ticket-btn');
  const checkoutCloseBtn = document.getElementById('checkout-modal-close-btn');

  // Pasos de Checkout
  const step1 = document.getElementById('checkout-step-1');
  const step2 = document.getElementById('checkout-step-2');
  const stepSuccess = document.getElementById('checkout-step-success');
  const tabStep1 = document.querySelector('.checkout-step-tab[data-step="1"]');
  const tabStep2 = document.querySelector('.checkout-step-tab[data-step="2"]');
  const btnProceedToPayment = document.getElementById('btn-proceed-to-payment');
  const btnBackToStep1 = document.getElementById('btn-back-to-step1');

  // Campos de Comprador
  const inputBuyerName = document.getElementById('buyer-name');
  const inputBuyerId = document.getElementById('buyer-id');
  const inputBuyerPhone = document.getElementById('buyer-phone');
  const inputBuyerEmail = document.getElementById('buyer-email');
  const modalSummaryQty = document.getElementById('modal-summary-qty');
  const modalSummaryTotal = document.getElementById('modal-summary-total');
  const btnCardAmount = document.getElementById('btn-card-amount');

  // Pestañas de Pago
  const paymentMethodCards = document.querySelectorAll('.payment-method-card');
  const paymentPanes = {
    card: document.getElementById('pane-card'),
    bank: document.getElementById('pane-bank'),
    paypal: document.getElementById('pane-paypal')
  };

  // Botones de Confirmación de Pago
  const btnPayCard = document.getElementById('btn-pay-card');
  const btnConfirmTransfer = document.getElementById('btn-confirm-transfer');
  const btnConfirmPaypal = document.getElementById('btn-confirm-paypal');
  const btnFinishCheckout = document.getElementById('btn-finish-checkout');
  const btnPrintReceipt = document.getElementById('btn-print-receipt');
  const linkAdvisorHelp = document.getElementById('link-advisor-help');

  // Recibo Digital
  const receiptOrderId = document.getElementById('receipt-order-id');
  const receiptBuyerName = document.getElementById('receipt-buyer-name');
  const receiptBuyerId = document.getElementById('receipt-buyer-id');
  const receiptBuyerPhone = document.getElementById('receipt-buyer-phone');
  const receiptTotalAmount = document.getElementById('receipt-total-amount');
  const receiptFoliosContainer = document.getElementById('receipt-folios-container');

  // Estado
  let currentQty = 3;
  let luckyNumbers = [];
  let currentBuyer = {
    name: '',
    id: '',
    phone: '',
    email: ''
  };

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

  // 2. Generador de Folios Oficiales
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

  // 3. Actualización de Pedido
  function updateOrder(qty) {
    currentQty = Math.max(1, Math.min(100, parseInt(qty) || 1));
    if (stepperInput) stepperInput.value = currentQty;

    const total = currentQty * TICKET_PRICE;
    const formattedTotal = total.toLocaleString('es-DO');

    if (summaryQty) summaryQty.innerText = currentQty;
    if (summaryTotal) summaryTotal.innerText = `RD$ ${formattedTotal}`;
    if (stickyPriceDisplay) stickyPriceDisplay.innerText = `RD$ ${formattedTotal}`;
    if (modalSummaryQty) modalSummaryQty.innerText = currentQty;
    if (modalSummaryTotal) modalSummaryTotal.innerText = `RD$ ${formattedTotal}`;
    if (btnCardAmount) btnCardAmount.innerText = `RD$ ${formattedTotal}`;

    // Sincronizar botones de paquetes
    packButtons.forEach(btn => {
      const btnQty = parseInt(btn.getAttribute('data-qty'));
      if (btnQty === currentQty) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Actualizar folios asignados
    luckyNumbers = generateLuckyNumbers(currentQty);
    renderLuckyNumbers();

    // Actualizar enlace de soporte
    if (linkAdvisorHelp) {
      const helpMsg = `Saludos a dtc & co. Deseo realizar una consulta para la compra en línea de ${currentQty} boletos para la Rifa Navideña 2026.`;
      linkAdvisorHelp.setAttribute('href', `https://wa.me/${WHATSAPP_PRIMARY}?text=${encodeURIComponent(helpMsg)}`);
      linkAdvisorHelp.setAttribute('target', '_blank');
      linkAdvisorHelp.setAttribute('rel', 'noopener');
    }
  }

  // Eventos de Selección de Boletos
  if (stepperMinus) {
    stepperMinus.addEventListener('click', () => updateOrder(currentQty - 1));
  }
  if (stepperPlus) {
    stepperPlus.addEventListener('click', () => updateOrder(currentQty + 1));
  }
  if (stepperInput) {
    stepperInput.addEventListener('change', (e) => updateOrder(e.target.value));
  }

  packButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const qty = parseInt(btn.getAttribute('data-qty'));
      updateOrder(qty);
    });
  });

  if (btnShuffle) {
    btnShuffle.addEventListener('click', () => {
      luckyNumbers = generateLuckyNumbers(currentQty);
      renderLuckyNumbers();
    });
  }

  updateOrder(currentQty);

  // 4. Apertura y Cierre de Modal de Checkout
  function openCheckoutModal() {
    if (!modalCheckout) return;
    // Resetear a paso 1
    showStep(1);
    modalCheckout.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckoutModal() {
    if (!modalCheckout) return;
    modalCheckout.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (btnOpenCheckout) btnOpenCheckout.addEventListener('click', openCheckoutModal);
  if (stickyCheckoutBtn) stickyCheckoutBtn.addEventListener('click', openCheckoutModal);
  if (checkoutCloseBtn) checkoutCloseBtn.addEventListener('click', closeCheckoutModal);

  if (modalCheckout) {
    modalCheckout.addEventListener('click', (e) => {
      if (e.target === modalCheckout) closeCheckoutModal();
    });
  }

  // 5. Navegación de Pasos de Checkout
  function showStep(stepNum) {
    if (stepNum === 1) {
      if (step1) step1.style.display = 'block';
      if (step2) step2.style.display = 'none';
      if (stepSuccess) stepSuccess.style.display = 'none';
      if (tabStep1) tabStep1.classList.add('active');
      if (tabStep2) tabStep2.classList.remove('active');
    } else if (stepNum === 2) {
      if (step1) step1.style.display = 'none';
      if (step2) step2.style.display = 'block';
      if (stepSuccess) stepSuccess.style.display = 'none';
      if (tabStep1) tabStep1.classList.remove('active');
      if (tabStep2) tabStep2.classList.add('active');
    } else if (stepNum === 3) {
      if (step1) step1.style.display = 'none';
      if (step2) step2.style.display = 'none';
      if (stepSuccess) stepSuccess.style.display = 'block';
      const stepsNav = document.getElementById('checkout-steps-nav');
      if (stepsNav) stepsNav.style.display = 'none';
    }
  }

  if (btnProceedToPayment) {
    btnProceedToPayment.addEventListener('click', () => {
      // Validar datos de cliente
      const name = inputBuyerName ? inputBuyerName.value.trim() : '';
      const id = inputBuyerId ? inputBuyerId.value.trim() : '';
      const phone = inputBuyerPhone ? inputBuyerPhone.value.trim() : '';
      const email = inputBuyerEmail ? inputBuyerEmail.value.trim() : '';

      if (!name || !id || !phone || !email) {
        alert('Por favor complete todos los datos requeridos para registrar formalmente los boletos a su nombre.');
        return;
      }

      currentBuyer = { name, id, phone, email };
      showStep(2);
    });
  }

  if (btnBackToStep1) {
    btnBackToStep1.addEventListener('click', () => showStep(1));
  }

  // 6. Selección de Métodos de Pago (Pestañas)
  paymentMethodCards.forEach(card => {
    card.addEventListener('click', () => {
      const method = card.getAttribute('data-method');
      paymentMethodCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      Object.keys(paymentPanes).forEach(key => {
        if (paymentPanes[key]) {
          paymentPanes[key].classList.toggle('active', key === method);
        }
      });
    });
  });

  // Formato visual para campos de tarjeta
  const cardNumberInput = document.getElementById('card-number');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      val = val.match(/.{1,4}/g)?.join(' ') || val;
      e.target.value = val;
    });
  }

  const cardExpiryInput = document.getElementById('card-expiry');
  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 3) {
        val = val.substring(0, 2) + '/' + val.substring(2);
      }
      e.target.value = val;
    });
  }

  // 7. Botones de Copiado de Cuentas Bancarias
  const copyButtons = document.querySelectorAll('.btn-copy-account');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalText = btn.innerHTML;
          btn.innerHTML = '<span>¡Copiado!</span>';
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 2000);
        });
      }
    });
  });

  // 8. Finalización y Emisión del Comprobante
  function completePayment(methodName) {
    const total = (currentQty * TICKET_PRICE).toLocaleString('es-DO');
    const randomOrderId = 'DTC-2026-' + Math.floor(1000 + Math.random() * 9000);

    if (receiptOrderId) receiptOrderId.innerText = `#${randomOrderId}`;
    if (receiptBuyerName) receiptBuyerName.innerText = currentBuyer.name || 'Titular Registrado';
    if (receiptBuyerId) receiptBuyerId.innerText = currentBuyer.id || 'N/D';
    if (receiptBuyerPhone) receiptBuyerPhone.innerText = currentBuyer.phone || 'N/D';
    if (receiptTotalAmount) receiptTotalAmount.innerText = `RD$ ${total} (${methodName})`;

    if (receiptFoliosContainer) {
      receiptFoliosContainer.innerHTML = '';
      luckyNumbers.forEach(n => {
        const tag = document.createElement('span');
        tag.className = 'receipt-folio-tag';
        tag.innerText = `Folio #${n}`;
        receiptFoliosContainer.appendChild(tag);
      });
    }

    showStep(3);
  }

  if (btnPayCard) {
    btnPayCard.addEventListener('click', () => {
      const cardNum = cardNumberInput ? cardNumberInput.value.replace(/\s/g, '') : '';
      if (cardNum.length < 15) {
        alert('Por favor ingrese un número de tarjeta válido.');
        return;
      }
      btnPayCard.innerHTML = '<span>Procesando transacción segura...</span>';
      setTimeout(() => {
        btnPayCard.innerHTML = '<span>Pagar de Forma Segura</span>';
        completePayment('Tarjeta de Crédito/Débito');
      }, 1200);
    });
  }

  if (btnConfirmTransfer) {
    btnConfirmTransfer.addEventListener('click', () => {
      const refInput = document.getElementById('bank-reference');
      const ref = refInput ? refInput.value.trim() : '';
      if (!ref) {
        alert('Por favor ingrese el número de referencia o autorización de su transferencia.');
        return;
      }
      completePayment('Transferencia Bancaria - Ref: ' + ref);
    });
  }

  if (btnConfirmPaypal) {
    btnConfirmPaypal.addEventListener('click', () => {
      const zelleInput = document.getElementById('zelle-reference');
      const ref = zelleInput ? zelleInput.value.trim() : '';
      if (!ref) {
        alert('Por favor ingrese la referencia o el nombre con el que envió por PayPal / Zelle.');
        return;
      }
      completePayment('PayPal / Zelle - Ref: ' + ref);
    });
  }

  if (btnPrintReceipt) {
    btnPrintReceipt.addEventListener('click', () => {
      window.print();
    });
  }

  if (btnFinishCheckout) {
    btnFinishCheckout.addEventListener('click', () => {
      closeCheckoutModal();
      const stepsNav = document.getElementById('checkout-steps-nav');
      if (stepsNav) stepsNav.style.display = 'flex';
      showStep(1);
    });
  }

  // 9. FAQ Accordion
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

  // 10. Modal de Bases del Concurso
  const modalTerms = document.getElementById('modal-terms');
  const modalOpenBtns = document.querySelectorAll('.open-terms-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  modalOpenBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalTerms) modalTerms.classList.add('active');
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      if (modalTerms) modalTerms.classList.remove('active');
    });
  }

  if (modalTerms) {
    modalTerms.addEventListener('click', (e) => {
      if (e.target === modalTerms) {
        modalTerms.classList.remove('active');
      }
    });
  }
});
