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

const propertiesData = [
  {
    id: 1,
    title: "Departamento en La Reina",
    operacion: "venta",
    tipo: "departamento",
    region: "rm",
    comuna: "la-reina",
    comunaLabel: "La Reina",
    dorm: 3,
    banos: 2,
    superficie: 95,
    precio: "UF 7.200",
    image: "assets/images/prop_la_reina.jpg",
    description: "Espectacular departamento con terraza vista despejada al oriente. Finas terminaciones, cocina equipada con cubierta de cuarzo, estacionamiento y bodega incluidos. Ubicado en sector residencial de alta plusvalía.",
    features: ["Vista Panorámica", "Terraza Privada", "Estacionamiento", "Bodega", "Calefacción Central"]
  },
  {
    id: 2,
    title: "Casa en Vitacura",
    operacion: "venta",
    tipo: "casa",
    region: "rm",
    comuna: "vitacura",
    comunaLabel: "Vitacura",
    dorm: 4,
    banos: 4,
    superficie: 250,
    precio: "UF 16.800",
    image: "assets/images/prop_vitacura.jpg",
    description: "Hermosa propiedad arquitectónica en exclusivo barrio de Vitacura. Amplios espacios iluminados, jardín consolidado con piscina, quincho techado y seguridad 24/7. Cercana a colegios y parque Bicentenario.",
    features: ["Piscina", "Quincho", "Jardín Consolidado", "Seguridad 24/7", "Gran Suite Principal"]
  },
  {
    id: 3,
    title: "Departamento en Las Condes",
    operacion: "arriendo",
    tipo: "departamento",
    region: "rm",
    comuna: "las-condes",
    comunaLabel: "Las Condes",
    dorm: 2,
    banos: 2,
    superficie: 120,
    precio: "UF 45 / mes",
    image: "assets/images/prop_las_condes.jpg",
    description: "Moderno departamento completamente equipado a pasos de metro El Golf. Amplia terraza, acabados de primer nivel, gimnasio, salón de eventos y conserjería permanente.",
    features: ["A Pasos del Metro", "Amoblado / Semiamoblado", "Gimnasio", "Salón de Eventos", "Seguridad"]
  },
  {
    id: 4,
    title: "Penthouse Exclusivo en Lo Barnechea",
    operacion: "venta",
    tipo: "departamento",
    region: "rm",
    comuna: "lo-barnechea",
    comunaLabel: "Lo Barnechea",
    dorm: 4,
    banos: 4,
    superficie: 310,
    precio: "UF 22.500",
    image: "assets/images/hero_bg.jpg",
    description: "Exclusivo Penthouse duplex con rooftop privado y piscina. Panorámicas vistas a los cerros de La Dehesa, acabados de lujo con pisos de madera noble y domótica integral.",
    features: ["Rooftop Privado", "Piscina Propia", "Domótica Integrada", "3 Estacionamientos", "Bodega Doble"]
  },
  {
    id: 5,
    title: "Oficina Prime en Providencia",
    operacion: "arriendo",
    tipo: "oficina",
    region: "rm",
    comuna: "providencia",
    comunaLabel: "Providencia",
    dorm: 2,
    banos: 2,
    superficie: 85,
    precio: "UF 38 / mes",
    image: "assets/images/zone_providencia.jpg",
    description: "Oficina corporativa habilitada en edificio A+ de Providencia. Recepción, privados climatizados, kitchenette y salas de reunión equipadas.",
    features: ["Climatización HVAC", "Seguridad 24/7", "Estacionamiento Visitas", "Acceso Controlado"]
  },
  {
    id: 6,
    title: "Casa Mediterránea en Las Condes",
    operacion: "venta",
    tipo: "casa",
    region: "rm",
    comuna: "las-condes",
    comunaLabel: "Las Condes",
    dorm: 5,
    banos: 4,
    superficie: 340,
    precio: "UF 19.900",
    image: "assets/images/zone_las_condes.jpg",
    description: "Elegante casa de estilo mediterráneo en pasaje cerrado de San Carlos de Apoquindo. Finas terminaciones, piscina temperada y paneles solares.",
    features: ["Paneles Solares", "Piscina Temperada", "Sector Residencial", "Loggia Techada"]
  }
];

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
  const op = filterOperacion ? filterOperacion.value : "todos";
  const tipo = filterTipo ? filterTipo.value : "todos";
  const region = filterRegion ? filterRegion.value : "todas";
  const comuna = filterComuna ? filterComuna.value : "todas";
  const keyword = document.getElementById("filterKeyword") ? document.getElementById("filterKeyword").value.toLowerCase().trim() : "";

  const filtered = propertiesData.filter(prop => {
    const matchOp = (op === "todos" || prop.operacion === op);
    const matchTipo = (tipo === "todos" || prop.tipo === tipo);
    const matchRegion = (region === "todas" || prop.region === region);
    const matchComuna = (comuna === "todas" || prop.comuna === comuna);
    const matchKeyword = !keyword || (
      prop.title.toLowerCase().includes(keyword) ||
      prop.description.toLowerCase().includes(keyword) ||
      prop.comunaLabel.toLowerCase().includes(keyword) ||
      prop.features.some(f => f.toLowerCase().includes(keyword))
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
          ${prop.features.map(f => `<span style="background: var(--bg-body); border: 1px solid var(--border-light); font-size: 0.78rem; font-weight: 600; padding: 0.3rem 0.7rem; border-radius: 4px; color: var(--text-dark);">${f}</span>`).join('')}
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

// Contact Form Handler
function handleFormSubmit(event) {
  event.preventDefault();
  closeContactModal();
  showToast("¡Muchas gracias! Tu mensaje ha sido enviado a un asesor.");
  event.target.reset();
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

// PocketBase Client Integration
const PUBLIC_PB_URL = "https://pb.noweb.tech";
let pbPublic = null;
if (typeof PocketBase !== "undefined") {
  pbPublic = new PocketBase(PUBLIC_PB_URL);
}

async function fetchPropertiesFromPocketBase() {
  if (!pbPublic) return;
  try {
    const records = await pbPublic.collection("propiedades").getFullList();

    if (records && records.length > 0) {
      propertiesData = records.map(r => {
        let imgUrl = "assets/images/hero_bg.jpg";
        let allImages = [];

        if (r.imagenes && r.imagenes.length > 0) {
          imgUrl = pbPublic.files.getUrl(r, r.imagenes[0]);
          allImages = r.imagenes.map(file => pbPublic.files.getUrl(r, file));
        } else if (r.image) {
          imgUrl = r.image;
          allImages = [r.image];
        }

        const precioStr = r.precio_texto || (r.moneda === "UF" ? `UF ${r.precio.toLocaleString('es-CL')}` : `$${r.precio.toLocaleString('es-CL')}`);

        return {
          id: r.id,
          title: r.titulo,
          operacion: r.operacion,
          tipo: r.tipo,
          region: r.region === "Región Metropolitana" ? "rm" : "valparaiso",
          comuna: r.comuna ? r.comuna.toLowerCase().replace(/\s+/g, '-') : "vitacura",
          comunaLabel: r.comuna || "Santiago",
          dorm: r.dormitorios || 0,
          banos: r.banos || 0,
          superficie: r.superficie_util || r.superficie_total || 0,
          precio: precioStr,
          image: imgUrl,
          allImages: allImages.length > 0 ? allImages : [imgUrl, "assets/images/zone_vitacura.jpg", "assets/images/zone_las_condes.jpg"],
          description: r.descripcion || "",
          features: r.caracteristicas || [],
          destacada: r.destacada || false,
          estado: r.estado || "disponible"
        };
      });
    }
  } catch (error) {
    console.warn("Could not fetch PocketBase properties, using static fallback:", error);
  }
}

// Single Property Page Renderer
function renderSinglePropertyPage(id) {
  const singlePropLayout = document.getElementById("singlePropLayout");
  if (!singlePropLayout) return;

  const prop = propertiesData.find(p => String(p.id) === String(id)) || propertiesData[0];

  // Update page titles
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
          ${prop.features.map(f => `<span style="background: #F8FAFC; border: 1px solid #E2E8F0; font-size: 0.82rem; font-weight: 700; padding: 0.4rem 0.85rem; border-radius: 50px; color: var(--bg-navy-header);">${f}</span>`).join('')}
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
