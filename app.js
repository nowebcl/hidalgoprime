// ----------------------------------------------------
// HIDALGO PRIME - APPLICATION LOGIC & INTERACTIVITY
// ----------------------------------------------------

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
    <div class="property-card" onclick="openPropertyModal(${prop.id})">
      <div class="card-image-wrap">
        <img src="${prop.image}" alt="${prop.title}" class="card-image">
        <span class="badge-tag">${prop.operacion}</span>
      </div>
      <div class="card-content">
        <h3 class="card-title">${prop.title}</h3>
        <div class="card-features">
          <div class="feature-item">
            <i data-lucide="bed"></i>
            <span>${prop.dorm} Dorm.</span>
          </div>
          <div class="feature-item">
            <i data-lucide="bath"></i>
            <span>${prop.banos} Baños</span>
          </div>
          <div class="feature-item">
            <i data-lucide="maximize-2"></i>
            <span>${prop.superficie} m²</span>
          </div>
        </div>
        <div class="card-price">${prop.precio}</div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

// Filter Action
function applyFilters() {
  const op = filterOperacion.value;
  const tipo = filterTipo.value;
  const region = filterRegion.value;
  const comuna = filterComuna.value;

  const filtered = propertiesData.filter(prop => {
    const matchOp = (op === "todos" || prop.operacion === op);
    const matchTipo = (tipo === "todos" || prop.tipo === tipo);
    const matchRegion = (region === "todas" || prop.region === region);
    const matchComuna = (comuna === "todas" || prop.comuna === comuna);
    return matchOp && matchTipo && matchRegion && matchComuna;
  });

  renderProperties(filtered);
}

function filterByComuna(comunaName) {
  if (filterComuna) {
    filterComuna.value = comunaName;
  }
  applyFilters();
  scrollToSection('propiedades');
}

function resetFiltersAndShowAll() {
  if (filterOperacion) filterOperacion.value = "todos";
  if (filterTipo) filterTipo.value = "todos";
  if (filterRegion) filterRegion.value = "todas";
  if (filterComuna) filterComuna.value = "todas";
  renderProperties(propertiesData);
  scrollToSection('propiedades');
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
          <a href="https://wa.me/56912345678?text=Hola,%20quisiera%20consultar%20por%20la%20propiedad:%20${encodeURIComponent(prop.title)}" target="_blank" class="btn-secondary" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; text-decoration: none; text-align: center;">
            <i data-lucide="message-circle" style="color: #25D366;"></i> Contactar por WhatsApp
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

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
  renderProperties(propertiesData);
});
