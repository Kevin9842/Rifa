// Rifa Navideña 2026 - Control Lógico y Pasarela de Pago Digital
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

  // Campos de Comprador (Únicamente 4 datos oficiales)
  const inputBuyerName = document.getElementById('buyer-name');
  const inputBuyerId = document.getElementById('buyer-id');
  const inputBuyerPhone = document.getElementById('buyer-phone');
  const inputBuyerAddress = document.getElementById('buyer-address');
  const modalSummaryQty = document.getElementById('modal-summary-qty');
  const modalSummaryTotal = document.getElementById('modal-summary-total');
  
  // Montos en Botones de Pago
  const btnCardAmount = document.getElementById('btn-card-amount');
  const btnGpayAmount = document.getElementById('btn-gpay-amount');
  const btnPaypalAmount = document.getElementById('btn-paypal-amount');

  // Pestañas de Pago
  const paymentMethodCards = document.querySelectorAll('.payment-method-card');
  const paymentPanes = {
    card: document.getElementById('pane-card'),
    gpay: document.getElementById('pane-gpay'),
    paypal: document.getElementById('pane-paypal')
  };

  // Botones de Confirmación de Pago
  const btnPayCard = document.getElementById('btn-pay-card');
  const btnPayGpay = document.getElementById('btn-pay-gpay');
  const btnPayPaypal = document.getElementById('btn-pay-paypal');
  const btnFinishCheckout = document.getElementById('btn-finish-checkout');
  const btnPrintReceipt = document.getElementById('btn-print-receipt');
  const btnDownloadTicket = document.getElementById('btn-download-ticket');
  const linkAdvisorHelp = document.getElementById('link-advisor-help');

  // Recibo Digital
  const receiptOrderId = document.getElementById('receipt-order-id');
  const receiptBuyerName = document.getElementById('receipt-buyer-name');
  const receiptBuyerId = document.getElementById('receipt-buyer-id');
  const receiptBuyerPhone = document.getElementById('receipt-buyer-phone');
  const receiptBuyerAddress = document.getElementById('receipt-buyer-address');
  const receiptTotalAmount = document.getElementById('receipt-total-amount');
  const receiptFoliosContainer = document.getElementById('receipt-folios-container');

  // Estado
  let currentQty = 3;
  let luckyNumbers = [];
  let currentBuyer = {
    name: '',
    id: '',
    phone: '',
    address: ''
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
      pill.innerHTML = `<span class="pill-dot"></span> Boleto #${num}`;
      ticketsListContainer.appendChild(pill);
    });
  }

  // 3. Actualización de Pedido y Montos
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
    if (btnGpayAmount) btnGpayAmount.innerText = `RD$ ${formattedTotal}`;
    if (btnPaypalAmount) btnPaypalAmount.innerText = `RD$ ${formattedTotal}`;

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



  updateOrder(currentQty);

  // 4. Apertura y Cierre de Modal de Checkout
  function openCheckoutModal() {
    if (!modalCheckout) return;
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
  if (heroTicketBtn) {
    heroTicketBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCheckoutModal();
    });
  }
  if (checkoutCloseBtn) checkoutCloseBtn.addEventListener('click', closeCheckoutModal);

  if (modalCheckout) {
    modalCheckout.addEventListener('click', (e) => {
      if (e.target === modalCheckout) closeCheckoutModal();
    });
  }

  // 5. Navegación de Pasos de Checkout
  function showStep(stepNum) {
    const stepsNav = document.getElementById('checkout-steps-nav');
    if (stepNum === 1) {
      if (step1) step1.style.display = 'block';
      if (step2) step2.style.display = 'none';
      if (stepSuccess) stepSuccess.style.display = 'none';
      if (stepsNav) stepsNav.style.display = 'flex';
      if (tabStep1) tabStep1.classList.add('active');
      if (tabStep2) tabStep2.classList.remove('active');
    } else if (stepNum === 2) {
      if (step1) step1.style.display = 'none';
      if (step2) step2.style.display = 'block';
      if (stepSuccess) stepSuccess.style.display = 'none';
      if (stepsNav) stepsNav.style.display = 'flex';
      if (tabStep1) tabStep1.classList.remove('active');
      if (tabStep2) tabStep2.classList.add('active');
    } else if (stepNum === 3) {
      if (step1) step1.style.display = 'none';
      if (step2) step2.style.display = 'none';
      if (stepSuccess) stepSuccess.style.display = 'block';
      if (stepsNav) stepsNav.style.display = 'none';
    }
  }

  if (btnProceedToPayment) {
    btnProceedToPayment.addEventListener('click', () => {
      const name = inputBuyerName ? inputBuyerName.value.trim() : '';
      const id = inputBuyerId ? inputBuyerId.value.trim() : '';
      const phone = inputBuyerPhone ? inputBuyerPhone.value.trim() : '';
      const address = inputBuyerAddress ? inputBuyerAddress.value.trim() : '';

      if (!name || !id || !phone || !address) {
        alert('Por favor complete los 4 datos requeridos (Nombre, Cédula, Número y Dirección) para registrar formalmente los boletos a su nombre.');
        return;
      }

      currentBuyer = { name, id, phone, address };
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

  // 7. Finalización y Emisión del Comprobante
  function completePayment(methodName) {
    const total = (currentQty * TICKET_PRICE).toLocaleString('es-DO');
    const randomOrderId = 'DTC-2026-' + Math.floor(1000 + Math.random() * 9000);

    if (receiptOrderId) receiptOrderId.innerText = `#${randomOrderId}`;
    if (receiptBuyerName) receiptBuyerName.innerText = currentBuyer.name || 'Titular Registrado';
    if (receiptBuyerId) receiptBuyerId.innerText = currentBuyer.id || 'N/D';
    if (receiptBuyerPhone) receiptBuyerPhone.innerText = currentBuyer.phone || 'N/D';
    if (receiptBuyerAddress) receiptBuyerAddress.innerText = currentBuyer.address || 'N/D';
    if (receiptTotalAmount) receiptTotalAmount.innerText = `RD$ ${total} (${methodName})`;

    if (receiptFoliosContainer) {
      receiptFoliosContainer.innerHTML = '';
      luckyNumbers.forEach(n => {
        const tag = document.createElement('span');
        tag.className = 'receipt-folio-tag';
        tag.innerText = `Boleto #${n}`;
        receiptFoliosContainer.appendChild(tag);
      });
    }

    showStep(3);
  }

  // Pago con Tarjeta
  if (btnPayCard) {
    btnPayCard.addEventListener('click', () => {
      const cardNum = cardNumberInput ? cardNumberInput.value.replace(/\s/g, '') : '';
      if (cardNum.length < 15) {
        alert('Por favor ingrese un número de tarjeta válido.');
        return;
      }
      btnPayCard.innerHTML = '<span>Procesando pago seguro...</span>';
      setTimeout(() => {
        btnPayCard.innerHTML = '<span>Pagar de Forma Segura</span>';
        completePayment('Tarjeta de Crédito/Débito');
      }, 1200);
    });
  }

  // Pago con Google Pay
  if (btnPayGpay) {
    btnPayGpay.addEventListener('click', () => {
      const originalContent = btnPayGpay.innerHTML;
      btnPayGpay.innerHTML = '<span>Autenticando con Google Pay...</span>';
      setTimeout(() => {
        btnPayGpay.innerHTML = originalContent;
        completePayment('Google Pay');
      }, 1100);
    });
  }

  // Pago con PayPal
  if (btnPayPaypal) {
    btnPayPaypal.addEventListener('click', () => {
      const originalContent = btnPayPaypal.innerHTML;
      btnPayPaypal.innerHTML = '<span>Conectando con PayPal...</span>';
      setTimeout(() => {
        btnPayPaypal.innerHTML = originalContent;
        completePayment('PayPal');
      }, 1100);
    });
  }

  if (btnPrintReceipt) {
    btnPrintReceipt.addEventListener('click', () => {
      window.print();
    });
  }

  // Descarga del Boleto Oficial Certificado
  if (btnDownloadTicket) {
    btnDownloadTicket.addEventListener('click', () => {
      const orderId = receiptOrderId ? receiptOrderId.innerText : 'DTC-2026';
      const name = currentBuyer.name || 'Participante Registrado';
      const id = currentBuyer.id || 'N/D';
      const phone = currentBuyer.phone || 'N/D';
      const address = currentBuyer.address || 'N/D';
      const foliosHtml = luckyNumbers.map(n => `<span style="display:inline-block; background:#637654; color:#ffffff; font-size:18px; font-weight:800; padding:6px 14px; border-radius:6px; margin:4px;">Boleto #${n}</span>`).join(' ');

      const ticketHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boleto Oficial - ${orderId} | Rifa Navideña 2026</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5efe6; color: #2d180d; padding: 30px 15px; margin: 0; }
    .ticket-card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 2px solid #b15529; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #b15529, #7a3212); color: #ffffff; padding: 22px; text-align: center; }
    .brand { font-size: 24px; font-weight: 900; letter-spacing: 1px; }
    .brand small { font-size: 14px; opacity: 0.9; margin-left: 2px; }
    .header h1 { margin: 6px 0 0 0; font-size: 22px; text-transform: uppercase; }
    .header p { margin: 4px 0 0 0; opacity: 0.9; font-size: 13px; }
    .body { padding: 24px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; background: #faf5ed; padding: 16px; border-radius: 8px; border: 1px solid #e7ded0; }
    .info-item { font-size: 14px; }
    .info-item strong { display: block; color: #7a3212; font-size: 11px; text-transform: uppercase; margin-bottom: 2px; }
    .folios-box { text-align: center; margin: 20px 0; padding: 18px; border: 2px dashed #637654; border-radius: 8px; background: #f2f7ef; }
    .prizes { font-size: 12px; color: #665c54; border-top: 1px solid #eedecb; padding-top: 14px; text-align: center; line-height: 1.5; }
    .footer { background: #351b0e; color: #ffffff; text-align: center; padding: 12px; font-size: 12px; }
    @media print { body { background: #ffffff; padding: 0; } .ticket-card { box-shadow: none; border: 1px solid #000; } }
  </style>
</head>
<body>
  <div class="ticket-card">
    <div class="header">
      <div class="brand">dtc<small>&CO</small></div>
      <h1>Boleto Oficial de Participación</h1>
      <p>Rifa Navideña 2026 • 20 de Diciembre • Monte Plata</p>
    </div>
    <div class="body">
      <div class="info-grid">
        <div class="info-item"><strong>No. Comprobante:</strong> ${orderId}</div>
        <div class="info-item"><strong>Titular Registrado:</strong> ${name}</div>
        <div class="info-item"><strong>Cédula:</strong> ${id}</div>
        <div class="info-item"><strong>Número de Teléfono:</strong> ${phone}</div>
        <div class="info-item" style="grid-column: span 2;"><strong>Dirección:</strong> ${address}</div>
      </div>
      <div class="folios-box">
        <strong style="display:block; margin-bottom:10px; color:#3e5033; font-size:14px; letter-spacing:0.5px;">BOLETOS ASIGNADOS Y REGISTRADOS OFICIALMENTE</strong>
        <div>${foliosHtml}</div>
      </div>
      <div class="prizes">
        <strong>Premios a sortear:</strong><br>
        1.er Lugar: Honda CR-V Touring 2022 | 2.º Lugar: Supermoto Husqvarna 701 (2026) | 3.er Lugar: 10 premios de RD$10,000 en efectivo
      </div>
    </div>
    <div class="footer">
      Sorteo oficial certificado por la administración de dtc & co en Monte Plata, R.D.
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([ticketHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Boleto-Rifa-2026-${orderId.replace('#', '')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  if (btnFinishCheckout) {
    btnFinishCheckout.addEventListener('click', () => {
      closeCheckoutModal();
      showStep(1);
    });
  }

  // 8. FAQ Accordion
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

  // 9. Modal de Bases del Concurso
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
