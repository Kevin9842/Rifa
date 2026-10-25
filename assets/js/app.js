// Rifa Navideña 2026 - Control Lógico y Pasarela de Pago Digital
document.addEventListener('DOMContentLoaded', () => {
  // Configuración General
  const TICKET_PRICE = 300;
  const WHATSAPP_PRIMARY = '18296391950';
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
  
  // Elementos de Transferencia y WhatsApp
  const transferTotalAmount = document.getElementById('transfer-total-amount');
  const transferQtySummary = document.getElementById('transfer-qty-summary');
  const guideTotalAmount = document.getElementById('guide-total-amount');
  const btnConfirmWhatsapp = document.getElementById('btn-confirm-whatsapp');
  const btnViewReceipt = document.getElementById('btn-view-receipt');
  const btnReceiptWhatsapp = document.getElementById('btn-receipt-whatsapp');
  const copyAccButtons = document.querySelectorAll('.btn-copy-acc');

  // Botones de Finalización
  const btnFinishCheckout = document.getElementById('btn-finish-checkout');
  const linkAdvisorHelp = document.getElementById('link-advisor-help');

  // Resumen de Solicitud
  const receiptQtyCount = document.getElementById('receipt-qty-count');
  const receiptBuyerName = document.getElementById('receipt-buyer-name');
  const receiptBuyerId = document.getElementById('receipt-buyer-id');
  const receiptBuyerPhone = document.getElementById('receipt-buyer-phone');
  const receiptBuyerAddress = document.getElementById('receipt-buyer-address');
  const receiptTotalAmount = document.getElementById('receipt-total-amount');

  // Estado
  let currentQty = 3;
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

  // 2. Actualización de Pedido y Montos
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
    
    // Transferencia Bancaria
    if (transferTotalAmount) transferTotalAmount.innerText = `RD$ ${formattedTotal}`;
    if (transferQtySummary) transferQtySummary.innerText = currentQty;
    if (guideTotalAmount) guideTotalAmount.innerText = `RD$ ${formattedTotal}`;

    // Sincronizar botones de paquetes
    packButtons.forEach(btn => {
      const btnQty = parseInt(btn.getAttribute('data-qty'));
      if (btnQty === currentQty) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Actualizar enlace de soporte
    if (linkAdvisorHelp) {
      const helpMsg = `Saludos a dtc & co. Deseo realizar una consulta para comprar ${currentQty} boletos para la Rifa Navideña 2026.`;
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
      if (stepsNav) stepsNav.style.display = 'none';
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

  // Navegación directa entre pestañas 1 y 2
  if (tabStep1) {
    tabStep1.style.cursor = 'pointer';
    tabStep1.addEventListener('click', () => showStep(1));
  }

  // Función auxiliar para registrar información del comprador
  function saveBuyerInfo() {
    const name = inputBuyerName && inputBuyerName.value.trim() ? inputBuyerName.value.trim() : 'Comprador Registrado';
    const id = inputBuyerId && inputBuyerId.value.trim() ? inputBuyerId.value.trim() : '001-0000000-0';
    const phone = inputBuyerPhone && inputBuyerPhone.value.trim() ? inputBuyerPhone.value.trim() : '(809) 000-0000';
    const address = inputBuyerAddress && inputBuyerAddress.value.trim() ? inputBuyerAddress.value.trim() : 'Monte Plata, RD';
    currentBuyer = { name, id, phone, address };
  }

  // Navegación directa entre pestañas 1 y 2
  if (tabStep1) {
    tabStep1.style.cursor = 'pointer';
    tabStep1.addEventListener('click', () => showStep(1));
  }

  if (tabStep2) {
    tabStep2.style.cursor = 'pointer';
    tabStep2.addEventListener('click', () => {
      saveBuyerInfo();
      showStep(2);
    });
  }

  if (btnProceedToPayment) {
    btnProceedToPayment.addEventListener('click', () => {
      saveBuyerInfo();
      // Boceto activo: no redirige externamente a WhatsApp
      closeCheckoutModal();
    });
  }

  if (btnBackToStep1) {
    btnBackToStep1.addEventListener('click', () => showStep(1));
  }

  // 6. Copiar Cuentas Bancarias con retroalimentación visual
  if (copyAccButtons) {
    copyAccButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          const accountText = targetEl.innerText.trim();
          navigator.clipboard.writeText(accountText).then(() => {
            const originalContent = btn.innerHTML;
            btn.innerHTML = '<span>¡Copiado!</span>';
            btn.classList.add('copied');
            setTimeout(() => {
              btn.innerHTML = originalContent;
              btn.classList.remove('copied');
            }, 1800);
          }).catch(() => {
            // Fallback si clipboard API no está disponible
            const originalContent = btn.innerHTML;
            btn.innerHTML = '<span>Copiado</span>';
            setTimeout(() => {
              btn.innerHTML = originalContent;
            }, 1800);
          });
        }
      });
    });
  }

  // Generador de Mensaje Oficial para WhatsApp
  function buildWhatsAppOrderMessage() {
    saveBuyerInfo();
    const total = (currentQty * TICKET_PRICE).toLocaleString('es-DO');
    const name = currentBuyer.name !== 'Comprador Registrado' ? currentBuyer.name : (inputBuyerName?.value.trim() || 'No especificado');
    const id = currentBuyer.id !== '001-0000000-0' ? currentBuyer.id : (inputBuyerId?.value.trim() || 'No especificada');
    const phone = currentBuyer.phone !== '(809) 000-0000' ? currentBuyer.phone : (inputBuyerPhone?.value.trim() || 'No especificado');
    const address = currentBuyer.address !== 'Monte Plata, RD' ? currentBuyer.address : (inputBuyerAddress?.value.trim() || 'No especificada');

    return `¡Hola dtc & co! 👋 Deseo comprar mis boletos para la *Rifa Navideña Monte Plata 2026* por transferencia bancaria.

📋 *Detalles de mi Pedido:*
• *Cantidad:* ${currentQty} ${currentQty === 1 ? 'Boleto' : 'Boletos'}
• *Total a Transferir:* RD$ ${total}

👤 *Datos del Participante:*
• *Nombre:* ${name}
• *Cédula:* ${id}
• *Teléfono:* ${phone}
• *Dirección:* ${address}

Adjunto el comprobante de pago de mi transferencia bancaria para que me envíen los números oficiales de mis boletos. ¡Muchas gracias!`;
  }

  // 7. Finalización y Resumen de Solicitud
  function completePayment() {
    const total = (currentQty * TICKET_PRICE).toLocaleString('es-DO');

    if (receiptQtyCount) receiptQtyCount.innerText = `${currentQty} ${currentQty === 1 ? 'Boleto' : 'Boletos'}`;
    if (receiptBuyerName) receiptBuyerName.innerText = currentBuyer.name || 'Titular Registrado';
    if (receiptBuyerId) receiptBuyerId.innerText = currentBuyer.id || 'N/D';
    if (receiptBuyerPhone) receiptBuyerPhone.innerText = currentBuyer.phone || 'N/D';
    if (receiptBuyerAddress) receiptBuyerAddress.innerText = currentBuyer.address || 'N/D';
    if (receiptTotalAmount) receiptTotalAmount.innerText = `RD$ ${total}`;

    if (btnReceiptWhatsapp) {
      const msg = buildWhatsAppOrderMessage();
      btnReceiptWhatsapp.href = `https://wa.me/${WHATSAPP_PRIMARY}?text=${encodeURIComponent(msg)}`;
    }

    showStep(3);
  }

  // Botón Principal de WhatsApp en Paso 2
  if (btnConfirmWhatsapp) {
    btnConfirmWhatsapp.addEventListener('click', () => {
      const msg = buildWhatsAppOrderMessage();
      const whatsappUrl = `https://wa.me/${WHATSAPP_PRIMARY}?text=${encodeURIComponent(msg)}`;
      window.open(whatsappUrl, '_blank');
      completePayment();
    });
  }

  // Botón Secundario para ver resumen digital
  if (btnViewReceipt) {
    btnViewReceipt.addEventListener('click', () => {
      saveBuyerInfo();
      completePayment();
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

  // Cinema Stage: Selector Interactivo de Escenas
  const cinemaVideo = document.getElementById('cinema-main-video');
  const cinemaPhoto = document.getElementById('cinema-main-photo');
  const cinemaCaption = document.getElementById('cinema-caption-title');
  const sceneButtons = document.querySelectorAll('.scene-tab-btn');

  sceneButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sceneButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mediaType = btn.getAttribute('data-type');
      const mediaSrc = btn.getAttribute('data-src');
      const mediaTitle = btn.getAttribute('data-title');

      if (cinemaCaption) cinemaCaption.textContent = mediaTitle;

      if (mediaType === 'video') {
        if (cinemaPhoto) cinemaPhoto.style.display = 'none';
        if (cinemaVideo) {
          cinemaVideo.style.display = 'block';
          cinemaVideo.pause();
          cinemaVideo.src = mediaSrc;
          cinemaVideo.load();
        }
      } else if (mediaType === 'photo') {
        if (cinemaVideo) {
          cinemaVideo.pause();
          cinemaVideo.style.display = 'none';
        }
        if (cinemaPhoto) {
          cinemaPhoto.style.display = 'block';
          cinemaPhoto.src = mediaSrc;
        }
      }
    });
  });
});
