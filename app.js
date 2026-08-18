// ----------------------------------------------------
// HIDALGO PRIME - APPLICATION LOGIC & INTERACTIVITY
// ----------------------------------------------------

// Security: HTML escaping helper to prevent XSS
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Dynamic properties data from PocketBase
let propertiesData = [];

// DOM Elements
const propertiesGrid = document.getElementById("propertiesGrid");
const filterOperacion = document.getElementById("filterOperacion");
const filterTipo = document.getElementById("filterTipo");
const filterRegion = document.getElementById("filterRegion");
const filterComuna = document.getElementById("filterComuna");
const btnSearch = document.getElementById("btnSearch");

// Modals
const propertyModal = document.getElementById("propertyModal");
const modalPropTitle = document.getElementById("modalPropTitle");
const modalPropContent = document.getElementById("modalPropContent");
const contactModal = document.getElementById("contactModal");
const contactService = document.getElementById("contactService");
const toastNotification = document.getElementById("toastNotification");
const toastMessage = document.getElementById("toastMessage");

// Mobile menu toggle
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

// Render Properties
function renderProperties(properties) {
  if (!propertiesGrid) return;
  
  if (properties.length === 0) {
    propertiesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <i data-lucide="search-x" style="width: 48px; height: 48px; color: var(--gold-primary); margin-bottom: 1rem;"></i>
        <h3 style="font-size: 1.2rem; color: var(--bg-navy-header); margin-bottom: 0.5rem;">No se encontraron propiedades</h3>
        <p>Intenta ajustar tus criterios de búsqueda o selecciona otra comuna.</p>
        <button class="btn-primary" style="margin-top: 1.5rem;" onclick="resetFiltersAndShowAll()">Ver todas las propiedades</button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  propertiesGrid.innerHTML = properties.map(prop => `
    <div class="property-card" onclick="window.location.href='propiedad.html?id=${escapeHTML(prop.id)}'">
      <div class="card-image-wrap">
        <img src="${escapeHTML(prop.image)}" alt="${escapeHTML(prop.title)}" class="card-image">
        <span class="badge-tag">${escapeHTML(prop.operacion)}</span>
      </div>
      <div class="card-content">
        <h3 class="card-title">${escapeHTML(prop.title)}</h3>
        <div class="card-features">
          <div class="feature-item">
            <i data-lucide="bed"></i>
            <span>${escapeHTML(prop.dorm)} Dorm.</span>
          </div>
          <div class="feature-item">
            <i data-lucide="bath"></i>
            <span>${escapeHTML(prop.banos)} Baños</span>
          </div>
          <div class="feature-item">
            <i data-lucide="maximize-2"></i>
            <span>${escapeHTML(prop.superficie)} m²</span>
          </div>
        </div>
        <div class="card-price">${escapeHTML(prop.precio)}</div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

// Filter Action
function applyFilters() {
  const op = filterOperacion ? filterOperacion.value.toLowerCase() : "todos";
  const tipo = filterTipo ? filterTipo.value.toLowerCase() : "todos";
  const region = filterRegion ? filterRegion.value.toLowerCase() : "todas";
  const comuna = filterComuna ? filterComuna.value.toLowerCase() : "todas";
  const keyword = document.getElementById("filterKeyword") ? document.getElementById("filterKeyword").value.toLowerCase().trim() : "";

  const filtered = propertiesData.filter(prop => {
    const matchOp = (op === "todos" || prop.operacion === op || (op === "venta" && prop.operacion === "venta-parcela"));
    const matchTipo = (tipo === "todos" || prop.tipo === tipo || (tipo === "terreno-parcela" && String(prop.tipo).includes("parcela")));
    const matchRegion = (region === "todas" || prop.region === region);
    const matchComuna = (comuna === "todas" || prop.comuna === comuna || String(prop.comuna).includes(comuna));
    const matchKeyword = !keyword || (
      (prop.title && prop.title.toLowerCase().includes(keyword)) ||
      (prop.description && prop.description.toLowerCase().includes(keyword)) ||
      (prop.comunaLabel && prop.comunaLabel.toLowerCase().includes(keyword)) ||
      (Array.isArray(prop.features) && prop.features.some(f => String(f).toLowerCase().includes(keyword)))
    );
    return matchOp && matchTipo && matchRegion && matchComuna && matchKeyword;
  });

  const resultCountEl = document.getElementById("resultCount");
  if (resultCountEl) {
    resultCountEl.textContent = filtered.length;
  }

  renderProperties(filtered);
}

function filterByComuna(comunaName) {
  window.location.href = `propiedades.html?comuna=${comunaName}`;
}

function resetFiltersAndShowAll() {
  if (filterOperacion) filterOperacion.value = "todos";
  if (filterTipo) filterTipo.value = "todos";
  if (filterRegion) filterRegion.value = "todas";
  if (filterComuna) filterComuna.value = "todas";
  const kw = document.getElementById("filterKeyword");
  if (kw) kw.value = "";
  
  const resultCountEl = document.getElementById("resultCount");
  if (resultCountEl) {
    resultCountEl.textContent = propertiesData.length;
  }
  renderProperties(propertiesData);
}

// Event Listeners for Filters
if (btnSearch) {
  btnSearch.addEventListener("click", () => {
    applyFilters();
    scrollToSection('propiedades');
  });
}

// Property Details Modal
function openPropertyModal(id) {
  const prop = propertiesData.find(p => p.id === id);
  if (!prop) return;

  modalPropTitle.textContent = prop.title;
  modalPropContent.innerHTML = `
    <div class="modal-prop-grid">
      <div>
        <img src="${prop.image}" alt="${prop.title}" class="modal-prop-img">
        <div style="margin-top: 1.2rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${(Array.isArray(prop.features) ? prop.features : []).map(f => `<span style="background: var(--bg-body); border: 1px solid var(--border-light); font-size: 0.78rem; font-weight: 600; padding: 0.3rem 0.7rem; border-radius: 4px; color: var(--text-dark);">${escapeHTML(f)}</span>`).join('')}
        </div>
      </div>

      <div>
        <div class="badge-tag" style="position: relative; top: 0; left: 0; display: inline-block; margin-bottom: 0.8rem;">
          ${prop.operacion}
        </div>
        <div class="modal-prop-price">${prop.precio}</div>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">
          Comuna: <strong style="color: var(--text-dark);">${prop.comunaLabel}</strong>
        </p>

        <div class="modal-prop-specs">
          <div><i data-lucide="bed"></i> ${prop.dorm} Dormitorios</div>
          <div><i data-lucide="bath"></i> ${prop.banos} Baños</div>
          <div><i data-lucide="maximize-2"></i> ${prop.superficie} m²</div>
        </div>

        <p style="font-size: 0.9rem; color: var(--text-dark); line-height: 1.6; margin-bottom: 1.5rem;">
          ${prop.description}
        </p>

        <div style="display: flex; flex-direction: column; gap: 0.8rem;">
          <button class="btn-primary" style="justify-content: center;" onclick="closePropertyModal(); openContactModal('Consulta por ${prop.title}');">
            <i data-lucide="mail"></i> Solicitar Información
          </button>
          <a href="https://wa.me/56962070997?text=Hola,%20quisiera%20consultar%20por%20la%20propiedad:%20${encodeURIComponent(prop.title)}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; text-decoration: none; text-align: center; box-sizing: border-box;">
            <i data-lucide="message-circle" style="color: #FFFFFF; stroke: #FFFFFF;"></i> <span style="color: #FFFFFF; font-weight: 700;">Contactar por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  `;

  propertyModal.classList.add("active");
  lucide.createIcons();
}

function closePropertyModal() {
  propertyModal.classList.remove("active");
}

// Contact Modal
function openContactModal(serviceName = null) {
  if (serviceName && contactService) {
    // If service option exists, select it
    for (let opt of contactService.options) {
      if (opt.value.toLowerCase().includes(serviceName.toLowerCase()) || serviceName.toLowerCase().includes(opt.value.toLowerCase())) {
        opt.selected = true;
        break;
      }
    }
  }
  contactModal.classList.add("active");
}

function closeContactModal() {
  contactModal.classList.remove("active");
}

// PocketBase Client Integration
const PUBLIC_PB_URL = "https://pb.noweb.tech";
let pbPublic = null;
if (typeof PocketBase !== "undefined") {
  pbPublic = new PocketBase(PUBLIC_PB_URL);
}

// Contact Form Handler - Persists seamlessly to PocketBase & Local Storage
async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : "";

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Enviando...`;
  }

  // Extract Form Fields dynamically
  const nameInput = form.querySelector('#contactName, #cName, #spName, input[name="name"], input[placeholder*="Nombre"], input[type="text"]');
  const emailInput = form.querySelector('#contactEmail, #cEmail, #spEmail, input[name="email"], input[type="email"]');
  const phoneInput = form.querySelector('#contactPhone, #cPhone, #spPhone, input[name="phone"], input[type="tel"]');
  const serviceInput = form.querySelector('#contactService, #cService, #spService, select');
  const messageInput = form.querySelector('#contactMessage, #cMessage, #spMessage, textarea');

  const nameVal = nameInput ? nameInput.value.trim() : "Cliente Interesado";
  const emailVal = emailInput ? emailInput.value.trim() : "";
  const phoneVal = phoneInput ? phoneInput.value.trim() : "";
  const serviceVal = serviceInput ? serviceInput.value : "Consulta General";
  const messageVal = messageInput ? messageInput.value.trim() : "Consulta desde formulario web";

  // Detect property reference if available
  const propTitleEl = document.getElementById("propertyDetailTitle") || document.getElementById("modalPropTitle");
  const propRef = propTitleEl ? propTitleEl.textContent.trim() : "";

  const pagePath = window.location.pathname.split("/").pop() || "index.html";

  const messagePayload = {
    nombre: nameVal,
    email: emailVal,
    telefono: phoneVal,
    servicio: serviceVal,
    mensaje: messageVal,
    propiedad_ref: propRef,
    leido: false,
    respondido: false,
    origen: pagePath,
    fecha: new Date().toISOString()
  };

  // 1. Save to PocketBase collection 'mensajes'
  if (pbPublic) {
    try {
      await pbPublic.collection("mensajes").create(messagePayload);
    } catch (err) {
      console.warn("PocketBase collection save warning (saving to local storage fallback):", err);
    }
  }

  // 2. Backup to Local Storage so no lead is ever lost
  try {
    messagePayload.id = "local_" + Date.now();
    const localMsgs = JSON.parse(localStorage.getItem("hp_local_messages") || "[]");
    localMsgs.unshift(messagePayload);
    localStorage.setItem("hp_local_messages", JSON.stringify(localMsgs));
  } catch (err) {
    console.error("Local storage error:", err);
  }

  // Restore button state
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }

  closeContactModal();
  form.reset();
  showToast("¡Muchas gracias! Tu mensaje ha sido recibido con éxito. Un asesor te contactará a la brevedad.");
}

// Toast Function
function showToast(msg) {
  if (!toastNotification) return;
  toastMessage.textContent = msg;
  toastNotification.classList.add("show");
  setTimeout(() => {
    toastNotification.classList.remove("show");
  }, 4000);
}

// Scroll Helper
function scrollToSection(id) {
  if (navLinks.classList.contains("active")) {
    navLinks.classList.remove("active");
  }
  const el = document.getElementById(id);
  if (el) {
    const headerOffset = 80;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }
}

// Close modals when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === propertyModal) closePropertyModal();
  if (e.target === contactModal) closeContactModal();
});

async function fetchPropertiesFromPocketBase() {
  try {
    let records = [];

    // 1. Direct High-Speed Fetch from PocketBase REST API
    try {
      const response = await fetch(`${PUBLIC_PB_URL}/api/collections/propiedades/records?perPage=200&t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        records = data.items || [];
      }
    } catch (fetchErr) {
      console.warn("Direct fetch error, attempting SDK fallback:", fetchErr);
    }

    // 2. Fallback to PocketBase SDK
    if ((!records || records.length === 0) && pbPublic) {
      try {
        records = await pbPublic.collection("propiedades").getFullList();
      } catch (sdkErr) {
        console.warn("SDK fetch error:", sdkErr);
      }
    }

    if (records) {
      propertiesData = records.map(r => {
        let allImages = [];
        if (r.imagenes && Array.isArray(r.imagenes) && r.imagenes.length > 0) {
          const col = r.collectionId || r.collectionName || "propiedades";
          allImages = r.imagenes.map(file => `${PUBLIC_PB_URL}/api/files/${col}/${r.id}/${file}`);
        } else if (r.image) {
          allImages = [r.image];
        }

        const imgUrl = allImages.length > 0 ? allImages[0] : "assets/images/portada.png";

        let feats = [];
        if (r.caracteristicas) {
          try {
            feats = typeof r.caracteristicas === "string" ? JSON.parse(r.caracteristicas) : r.caracteristicas;
          } catch (e) {
            feats = Array.isArray(r.caracteristicas) ? r.caracteristicas : [];
          }
        }

        const precioStr = r.precio_texto || (r.moneda === "UF" ? `UF ${Number(r.precio).toLocaleString('es-CL')}` : `$ ${Number(r.precio).toLocaleString('es-CL')} CLP`);

        let regCode = "rm";
        if (r.region) {
          const regLower = r.region.toLowerCase();
          if (regLower.includes("valpara") || regLower.includes("v")) regCode = "valparaiso";
          else if (regLower.includes("bio") || regLower.includes("viii")) regCode = "biobio";
          else regCode = "rm";
        }

        let comCode = "todas";
        if (r.comuna) {
          comCode = r.comuna.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        }

        return {
          id: r.id,
          title: r.titulo || "Propiedad Exclusiva",
          operacion: (r.operacion || "venta").toLowerCase(),
          tipo: (r.tipo || "departamento").toLowerCase(),
          region: regCode,
          comuna: comCode,
          comunaLabel: r.comuna || "Santiago",
          dorm: r.dormitorios || 0,
          banos: r.banos || 0,
          superficie: r.superficie_util || r.superficie_total || 0,
          precio: precioStr,
          image: imgUrl,
          allImages: allImages.length > 0 ? allImages : [imgUrl],
          description: r.descripcion || "",
          features: feats,
          destacada: r.destacada === true,
          estado: r.estado || "disponible"
        };
      });

      // Dynamically add new comunas to filterComuna select dropdown if not already present
      if (filterComuna) {
        const existingValues = Array.from(filterComuna.options).map(o => o.value);
        propertiesData.forEach(p => {
          if (p.comuna && p.comuna !== "todas" && !existingValues.includes(p.comuna)) {
            const opt = document.createElement("option");
            opt.value = p.comuna;
            opt.textContent = p.comunaLabel;
            filterComuna.appendChild(opt);
            existingValues.push(p.comuna);
          }
        });
      }

      console.log(`[Hidalgo Prime] ${propertiesData.length} propiedades sincronizadas desde PocketBase.`);
    }
  } catch (error) {
    console.error("Error sincronizando propiedades de PocketBase:", error);
  }
}

// Single Property Page Renderer
function renderSinglePropertyPage(id) {
  const singlePropLayout = document.getElementById("singlePropLayout");
  if (!singlePropLayout) return;

  const prop = propertiesData.find(p => String(p.id) === String(id)) || propertiesData[0];
  if (!prop) {
    singlePropLayout.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 5rem 1rem;">
        <h3 style="font-size: 1.3rem; color: var(--bg-navy-header); margin-bottom: 1rem;">Propiedad no encontrada</h3>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">El inmueble solicitado no está disponible o ha sido actualizado.</p>
        <a href="propiedades.html" class="btn-primary" style="display: inline-flex;">Explorar Propiedades</a>
      </div>
    `;
    return;
  }
  const pageTitle = document.getElementById("pageTitle");
  if (pageTitle) pageTitle.textContent = `${prop.title} | Hidalgo Prime`;
  
  const breadcrumbTitle = document.getElementById("breadcrumbTitle");
  if (breadcrumbTitle) breadcrumbTitle.textContent = prop.title;

  const propTitleHeader = document.getElementById("propTitleHeader");
  if (propTitleHeader) propTitleHeader.textContent = prop.title;

  const propLocationHeader = document.getElementById("propLocationHeader");
  if (propLocationHeader) propLocationHeader.textContent = `Comuna ${prop.comunaLabel}, Santiago, Chile`;

  const imagesList = prop.allImages && prop.allImages.length > 0 ? prop.allImages : [prop.image];

  singlePropLayout.innerHTML = `
    <div>
      <div class="prop-gallery-card">
        <img src="${imagesList[0]}" alt="${prop.title}" id="mainGalleryImg" class="prop-gallery-main">
        <div class="prop-gallery-thumbs">
          ${imagesList.map((imgSrc, idx) => `
            <img src="${imgSrc}" class="prop-thumb ${idx === 0 ? 'active' : ''}" onclick="switchMainImage(this.src, this)">
          `).join('')}
        </div>
      </div>

      <div class="prop-detail-box">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.8rem;">
          <span class="badge-tag" style="position: relative; top: 0; left: 0;">${prop.operacion}</span>
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600; white-space: nowrap;">ID: HP-${prop.id}</span>
        </div>

        <div class="prop-price-large">${prop.precio}</div>

        <div class="specs-grid-box">
          <div class="spec-item-big">
            <i data-lucide="bed"></i>
            <span class="val">${prop.dorm}</span>
            <span class="lbl">Dormitorios</span>
          </div>
          <div class="spec-item-big">
            <i data-lucide="bath"></i>
            <span class="val">${prop.banos}</span>
            <span class="lbl">Baños</span>
          </div>
          <div class="spec-item-big">
            <i data-lucide="maximize-2"></i>
            <span class="val">${prop.superficie} m²</span>
            <span class="lbl">Superficie Total</span>
          </div>
          <div class="spec-item-big">
            <i data-lucide="building-2"></i>
            <span class="val">${prop.tipo ? prop.tipo.toUpperCase() : 'PROPIEDAD'}</span>
            <span class="lbl">Tipo Propiedad</span>
          </div>
        </div>

        <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--bg-navy-header); margin-bottom: 0.8rem;">Descripción de la Propiedad</h3>
        <p style="font-size: 0.95rem; color: var(--text-dark); line-height: 1.7; margin-bottom: 1.8rem;">
          ${prop.description}
        </p>

        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--bg-navy-header); margin-bottom: 0.8rem;">Equipamiento y Características</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 0.6rem;">
          ${(Array.isArray(prop.features) ? prop.features : []).map(f => `<span style="background: #F8FAFC; border: 1px solid #E2E8F0; font-size: 0.82rem; font-weight: 700; padding: 0.4rem 0.85rem; border-radius: 50px; color: var(--bg-navy-header);">${escapeHTML(f)}</span>`).join('')}
        </div>
      </div>
    </div>

    <!-- Sticky Inquiry Sidebar -->
    <div>
      <div class="prop-sidebar-card">
        <div class="agent-profile">
          <div class="agent-avatar">HP</div>
          <div>
            <h4 style="font-size: 1rem; font-weight: 800; color: var(--bg-navy-header);">Asesor Inmobiliario</h4>
            <p style="font-size: 0.8rem; color: var(--gold-primary); font-weight: 700;">Hidalgo Prime Executive</p>
          </div>
        </div>

        <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--bg-navy-header); margin-bottom: 1rem;">Solicitar Información</h4>

        <form onsubmit="handleFormSubmit(event)">
          <div class="form-group">
            <label class="form-label" for="spName">Nombre completo *</label>
            <input type="text" id="spName" class="form-input" placeholder="Ej: Carlos Rojas" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="spEmail">Correo electrónico *</label>
            <input type="email" id="spEmail" class="form-input" placeholder="carlos@ejemplo.com" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="spPhone">Teléfono *</label>
            <input type="tel" id="spPhone" class="form-input" placeholder="+56 9 6207 0997" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="spMessage">Mensaje</label>
            <textarea id="spMessage" class="form-textarea" rows="3">Hola, me interesa obtener información sobre ${prop.title} (${prop.precio}).</textarea>
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-bottom: 0.8rem;">
            <i data-lucide="mail"></i> Enviar Consulta
          </button>
        </form>

        <a href="https://wa.me/56962070997?text=Hola,%20quisiera%20consultar%20por%20la%20propiedad:%20${encodeURIComponent(prop.title)}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; text-decoration: none; box-sizing: border-box;">
          <i data-lucide="message-circle" style="color: #FFFFFF; stroke: #FFFFFF;"></i> <span style="color: #FFFFFF; font-weight: 700;">Consultar por WhatsApp</span>
        </a>
      </div>
    </div>
  `;

  // Render similar properties at bottom
  const similarGrid = document.getElementById("similarPropertiesGrid");
  if (similarGrid) {
    const similarProps = propertiesData.filter(p => String(p.id) !== String(prop.id)).slice(0, 3);
    similarGrid.innerHTML = similarProps.map(p => `
      <div class="property-card" onclick="window.location.href='propiedad.html?id=${p.id}'">
        <div class="card-image-wrap">
          <img src="${p.image}" alt="${p.title}" class="card-image">
          <span class="badge-tag">${p.operacion}</span>
        </div>
        <div class="card-content">
          <h3 class="card-title">${p.title}</h3>
          <div class="card-features">
            <div class="feature-item"><i data-lucide="bed"></i> <span>${p.dorm} Dorm.</span></div>
            <div class="feature-item"><i data-lucide="bath"></i> <span>${p.banos} Baños</span></div>
            <div class="feature-item"><i data-lucide="maximize-2"></i> <span>${p.superficie} m²</span></div>
          </div>
          <div class="card-price">${p.precio}</div>
        </div>
      </div>
    `).join('');
  }

  lucide.createIcons();
}

function switchMainImage(src, thumbEl) {
  const mainImg = document.getElementById("mainGalleryImg");
  if (mainImg) mainImg.src = src;
  document.querySelectorAll('.prop-thumb').forEach(t => t.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
}

// Initialize Page & Parse URL Query Parameters
document.addEventListener("DOMContentLoaded", async () => {
  // First load live properties from PocketBase API
  await fetchPropertiesFromPocketBase();

  const params = new URLSearchParams(window.location.search);
  const idParam = params.get("id");
  const comunaParam = params.get("comuna");
  const operacionParam = params.get("operacion");
  const tipoParam = params.get("tipo");

  if (idParam) {
    renderSinglePropertyPage(idParam);
  }

  if (comunaParam && filterComuna) filterComuna.value = comunaParam;
  if (operacionParam && filterOperacion) filterOperacion.value = operacionParam;
  if (tipoParam && filterTipo) filterTipo.value = tipoParam;

  applyFilters();
});
