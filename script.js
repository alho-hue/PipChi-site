/* script.js - VERSION COMPLÈTEMENT CORRIGÉE */

const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);

/* ---------- DOM Ready ---------- */
document.addEventListener('DOMContentLoaded', () => {
  
  // SVG placeholder optimisé
  const svgDemo = '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="#1a2438"/><rect x="20" y="20" width="110" height="110" fill="#2d3748" stroke="#4a5568" stroke-width="1"/><text x="75" y="80" fill="#9aa3b2" font-size="12" font-family="Arial" text-anchor="middle" dominant-baseline="middle">Image</text></svg>';
  const dataDemo = 'data:image/svg+xml;base64,' + btoa(svgDemo);

  /* ---------- Gestion des erreurs globales ---------- */
  window.addEventListener('error', (e) => {
    console.error('Erreur globale:', e.error);
  });

  /* ---------- COMPTEUR AVIS EN ATTENTE ---------- */
  function updatePendingReviewsCount() {
    const reviews = JSON.parse(localStorage.getItem('pipchi_reviews') || '[]');
    const pendingReviews = reviews.filter(r => !r.approved).length;
    const badge = qs('#pendingReviewsCount');
    
    if (badge) {
      badge.textContent = pendingReviews;
      if (pendingReviews > 0) {
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  /* ---------- NETTOYAGE ANALYTICS ---------- */
  function cleanAnalytics() {
    const analytics = JSON.parse(localStorage.getItem('pipchi_analytics') || '{"products":{}}');
    const productIds = products.map(p => p.id);
    
    // Nettoyer les produits supprimés
    Object.keys(analytics.products).forEach(productId => {
      if (!productIds.includes(productId)) {
        delete analytics.products[productId];
      }
    });
    
    localStorage.setItem('pipchi_analytics', JSON.stringify(analytics));
    updateAnalyticsDisplay();
  }

  /* ---------- Navigation mobile ---------- */
  const mobileMenuBtn = qs('#mobileMenuBtn');
  const mainNav = qs('#mainNav');
  
  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    });
    
    // Fermer le menu en cliquant sur un lien
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Progress bar ---------- */
  const progressBar = qs('#progressBar');
  function updateProgress() {
    if (!progressBar) return;
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height ? (winScroll / height) * 100 : 0;
    progressBar.style.width = scrolled + '%';
  }
  window.addEventListener('scroll', updateProgress);
  updateProgress();

  /* ---------- Scroll-to-top button ---------- */
  const scrollTopBtn = qs('#scrollTopBtn');
  function toggleScrollTop() {
    if (!scrollTopBtn) return;
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
      scrollTopBtn.style.display = 'block';
    } else {
      scrollTopBtn.style.display = 'none';
    }
  }
  window.addEventListener('scroll', toggleScrollTop);
  toggleScrollTop();
  
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Gestion des formulaires ---------- */
  function setupFormValidation() {
    // Contact form
    const contactForm = qs('#contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = qs('#name');
        const email = qs('#email');
        const subject = qs('#subject');
        const message = qs('#message');
        let isValid = true;

        // Reset errors
        qsa('.error').forEach(el => el.classList.remove('show'));

        // Validation
        if (!name.value.trim()) {
          qs('#nameError').classList.add('show');
          isValid = false;
        }
        if (!email.value.trim() || !/^\S+@\S+\.\S+$/.test(email.value)) {
          qs('#emailError').classList.add('show');
          isValid = false;
        }
        if (!subject.value.trim()) {
          qs('#subjectError').classList.add('show');
          isValid = false;
        }
        if (!message.value.trim()) {
          qs('#messageError').classList.add('show');
          isValid = false;
        }

        if (isValid) {
          // Simuler l'envoi
          contactForm.classList.add('loading');
          setTimeout(() => {
            contactForm.classList.remove('loading');
            alert('Message envoyé avec succès !');
            contactForm.reset();
          }, 1000);
        } else {
          // Scroll to first error
          const firstError = contactForm.querySelector('.error.show');
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
    }

    // Review form
    const reviewForm = qs('#reviewForm');
    const charCount = qs('#charCount');
    const reviewText = qs('#reviewText');

    if (reviewText && charCount) {
      reviewText.addEventListener('input', () => {
        charCount.textContent = reviewText.value.length;
      });
    }

    if (reviewForm) {
      reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = qs('#reviewName');
        const rating = qs('#reviewRating');
        const text = qs('#reviewText');

        if (!name.value.trim() || !rating.value || !text.value.trim()) {
          alert('Veuillez remplir tous les champs');
          return;
        }

        const review = {
          id: 'r_' + Date.now(),
          name: name.value.trim(),
          rating: parseInt(rating.value),
          text: text.value.trim(),
          date: new Date().toISOString(),
          approved: false // Modération manuelle
        };

        saveReview(review);
        reviewForm.reset();
        if (charCount) charCount.textContent = '0';
        alert('Merci pour votre avis ! Il sera publié après modération.');
      });
    }
  }

  /* ---------- SYSTÈME D'AVIS CLIENTS CORRIGÉ ---------- */
function initReviews() {
    if (!localStorage.getItem('pipchi_reviews')) {
        // Ajouter quelques avis de démonstration
        const demoReviews = [
            {
                id: 'r_1',
                name: 'Marie D.',
                rating: 5,
                text: 'Service excellent, produits de qualité ! Livraison rapide.',
                date: new Date(Date.now() - 86400000).toISOString(),
                approved: true
            },
            {
                id: 'r_2',
                name: 'Ahmed S.',
                rating: 4,
                text: 'Très satisfait de mon achat, je recommande PipChi !',
                date: new Date(Date.now() - 172800000).toISOString(),
                approved: true
            },
            {
                id: 'r_3',
                name: 'Fatou K.',
                rating: 5,
                text: 'Rapport qualité-prix exceptionnel. Service client au top !',
                date: new Date(Date.now() - 259200000).toISOString(),
                approved: false
            }
        ];
        localStorage.setItem('pipchi_reviews', JSON.stringify(demoReviews));
    }
    renderReviews();
    updatePendingReviewsCount();
}

function saveReview(review) {
    try {
        const reviews = JSON.parse(localStorage.getItem('pipchi_reviews') || '[]');
        reviews.unshift(review);
        localStorage.setItem('pipchi_reviews', JSON.stringify(reviews));
        renderReviews();
        updateReviewsStats();
        updatePendingReviewsCount();
        return true;
    } catch (error) {
        console.error('Erreur sauvegarde avis:', error);
        return false;
    }
}

function renderReviews() {
    const grid = qs('#testimonialGrid');
    const adminList = qs('#adminReviewsList');
    const reviews = JSON.parse(localStorage.getItem('pipchi_reviews') || '[]');

    // Afficher sur la page principale
    if (grid) {
        const approvedReviews = reviews.filter(r => r.approved).slice(0, 6);
        
        if (approvedReviews.length === 0) {
            grid.innerHTML = `
                <div class="testimonial-item" style="grid-column:1/-1;text-align:center">
                    <p style="color:var(--muted)">Soyez le premier à laisser un avis !</p>
                </div>
            `;
        } else {
            grid.innerHTML = approvedReviews.map(review => `
                <div class="testimonial-item fade-in">
                    <div class="testimonial-header">
                        <div class="testimonial-author">${escapeHtml(review.name)}</div>
                        <div class="testimonial-date">${new Date(review.date).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div class="testimonial-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                    <div class="testimonial-text">${escapeHtml(review.text)}</div>
                </div>
            `).join('');
        }
    }

    // Afficher dans l'admin
    if (adminList) {
        if (reviews.length === 0) {
            adminList.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px">Aucun avis à modérer</p>';
        } else {
            adminList.innerHTML = reviews.map(review => `
                <div class="review-item">
                    <div class="review-item-header">
                        <div class="review-item-author">${escapeHtml(review.name)}</div>
                        <div class="review-item-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                    </div>
                    <div class="review-item-date">
                        ${new Date(review.date).toLocaleDateString('fr-FR')} • 
                        ${review.approved ? 
                            '<span style="color:#00d1b2">✅ Approuvé</span>' : 
                            '<span style="color:#ff6666">⏳ En attente</span>'
                        }
                    </div>
                    <div class="review-item-text">${escapeHtml(review.text)}</div>
                    <div class="review-actions">
                        ${!review.approved ? 
                            `<button class="btn small" onclick="approveReview('${review.id}')">✅ Approuver</button>` : 
                            `<button class="btn small ghost" onclick="unapproveReview('${review.id}')">↶ Désapprouver</button>`
                        }
                        <button class="btn small ghost" onclick="deleteReview('${review.id}')">🗑️ Supprimer</button>
                    </div>
                </div>
            `).join('');
        }
    }
}

function updateReviewsStats() {
    const reviews = JSON.parse(localStorage.getItem('pipchi_reviews') || '[]');
    const approvedReviews = reviews.filter(r => r.approved);
    
    if (approvedReviews.length > 0) {
        const averageRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length;
        const fiveStarReviews = approvedReviews.filter(r => r.rating === 5).length;

        if (qs('#averageRating')) qs('#averageRating').textContent = averageRating.toFixed(1);
        if (qs('#totalReviews')) qs('#totalReviews').textContent = approvedReviews.length;
        if (qs('#fiveStarReviews')) qs('#fiveStarReviews').textContent = fiveStarReviews;
    } else {
        if (qs('#averageRating')) qs('#averageRating').textContent = '0.0';
        if (qs('#totalReviews')) qs('#totalReviews').textContent = '0';
        if (qs('#fiveStarReviews')) qs('#fiveStarReviews').textContent = '0';
    }
}

// Fonctions globales pour la modération
window.approveReview = function(reviewId) {
    const reviews = JSON.parse(localStorage.getItem('pipchi_reviews') || '[]');
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    
    if (reviewIndex !== -1) {
        reviews[reviewIndex].approved = true;
        localStorage.setItem('pipchi_reviews', JSON.stringify(reviews));
        renderReviews();
        updateReviewsStats();
        updatePendingReviewsCount();
        alert('✅ Avis approuvé avec succès !');
    }
};

window.unapproveReview = function(reviewId) {
    const reviews = JSON.parse(localStorage.getItem('pipchi_reviews') || '[]');
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    
    if (reviewIndex !== -1) {
        reviews[reviewIndex].approved = false;
        localStorage.setItem('pipchi_reviews', JSON.stringify(reviews));
        renderReviews();
        updateReviewsStats();
        updatePendingReviewsCount();
        alert('↶ Avis désapprouvé !');
    }
};

window.deleteReview = function(reviewId) {
    if (!confirm('Supprimer définitivement cet avis ?')) return;
    
    const reviews = JSON.parse(localStorage.getItem('pipchi_reviews') || '[]');
    const filteredReviews = reviews.filter(r => r.id !== reviewId);
    localStorage.setItem('pipchi_reviews', JSON.stringify(filteredReviews));
    renderReviews();
    updateReviewsStats();
    updatePendingReviewsCount();
    alert('🗑️ Avis supprimé avec succès !');
};

  /* ---------- ANALYTICS & TRACKING ---------- */
  function initAnalytics() {
    if (!localStorage.getItem('pipchi_analytics')) {
      localStorage.setItem('pipchi_analytics', JSON.stringify({
        visits: 0,
        clicks: [],
        products: {},
        lastVisit: null
      }));
    }

    // Compter la visite
    const analytics = JSON.parse(localStorage.getItem('pipchi_analytics'));
    analytics.visits = (analytics.visits || 0) + 1;
    analytics.lastVisit = new Date().toISOString();
    localStorage.setItem('pipchi_analytics', JSON.stringify(analytics));
  }

  function trackProductClick(productId, productName) {
    const analytics = JSON.parse(localStorage.getItem('pipchi_analytics'));
    
    analytics.clicks.push({
      productId,
      productName,
      timestamp: new Date().toISOString()
    });
    
    if (!analytics.products[productId]) {
      analytics.products[productId] = {
        name: productName,
        clicks: 0,
        views: 0
      };
    }
    analytics.products[productId].clicks++;
    
    localStorage.setItem('pipchi_analytics', JSON.stringify(analytics));
    updateAnalyticsDisplay();
  }

  function updateAnalyticsDisplay() {
    const analytics = JSON.parse(localStorage.getItem('pipchi_analytics'));
    const totalClicks = analytics.clicks.length;
    
    // Trouver le produit le plus populaire
    let popularProduct = '-';
    let maxClicks = 0;
    
    Object.values(analytics.products).forEach(product => {
      if (product.clicks > maxClicks) {
        maxClicks = product.clicks;
        popularProduct = product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name;
      }
    });

    // Mettre à jour l'affichage
    if (qs('#totalClicks')) qs('#totalClicks').textContent = totalClicks;
    if (qs('#popularProduct')) qs('#popularProduct').textContent = popularProduct;
    if (qs('#totalVisits')) qs('#totalVisits').textContent = analytics.visits;
    
    // Calculer le taux de conversion (simulé)
    const conversionRate = analytics.visits > 0 ? Math.min(100, Math.round((totalClicks / analytics.visits) * 100)) : 0;
    if (qs('#conversionRate')) qs('#conversionRate').textContent = conversionRate + '%';
    
    // Mettre à jour la liste détaillée
    const analyticsList = qs('#clickAnalytics');
    if (analyticsList) {
      analyticsList.innerHTML = '';
      
      Object.entries(analytics.products)
        .sort(([,a], [,b]) => b.clicks - a.clicks)
        .forEach(([id, product]) => {
          const item = document.createElement('div');
          item.className = 'analytics-item';
          item.innerHTML = `
            <span class="product-name">${product.name}</span>
            <span class="click-count">${product.clicks} clicks</span>
          `;
          analyticsList.appendChild(item);
        });
    }

    // Top produits
    const topProducts = qs('#topProducts');
    if (topProducts) {
      const top5 = Object.entries(analytics.products)
        .sort(([,a], [,b]) => b.clicks - a.clicks)
        .slice(0, 5);
      
      topProducts.innerHTML = top5.length > 0 ? 
        top5.map(([id, product]) => `
          <div class="analytics-item">
            <span class="product-name">${product.name}</span>
            <span class="click-count">${product.clicks}</span>
          </div>
        `).join('') : 
        '<p style="color:var(--muted);text-align:center">Aucune donnée</p>';
    }
  }

  /* ---------- POPUP DE REDIRECTION ---------- */
  const redirectPopup = qs('#redirectPopup');
  const confirmRedirect = qs('#confirmRedirect');
  const cancelRedirect = qs('#cancelRedirect');
  let currentRedirectUrl = '';

  function showRedirectPopup(productName, productUrl) {
    currentRedirectUrl = productUrl;
    const message = qs('#redirectMessage');
    message.textContent = `Vous allez être redirigé vers OUMISTORE pour commander "${productName}". Continuer ?`;
    redirectPopup.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function hideRedirectPopup() {
    redirectPopup.classList.add('hidden');
    document.body.style.overflow = '';
    currentRedirectUrl = '';
  }

  if (confirmRedirect) {
    confirmRedirect.addEventListener('click', () => {
      if (currentRedirectUrl) {
        window.open(currentRedirectUrl, '_blank');
      }
      hideRedirectPopup();
    });
  }

  if (cancelRedirect) {
    cancelRedirect.addEventListener('click', hideRedirectPopup);
  }

  if (redirectPopup) {
    redirectPopup.addEventListener('click', (e) => {
      if (e.target === redirectPopup) hideRedirectPopup();
    });
  }

  /* ---------- PRODUITS & ADMIN ---------- */
  const ADMIN_PASSWORD = "pipchi123";
  let products = [];

  // Catégories avec icônes - CORRIGÉE avec "Autres"
  const categories = {
    'vetements': '👕 Vêtements',
    'accessoires': '👜 Accessoires',
    'electronique': '📱 Électronique',
    'maison': '🏠 Maison',
    'autres': '📦 Autres'
  };

  function uid(){ 
    return 'p_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5); 
  }
  
  function safeLoad(){ 
    try{ 
      const stored = localStorage.getItem('pipchi_products');
      products = stored ? JSON.parse(stored) : [];
      return true;
    }catch(e){ 
      console.error('Erreur chargement produits:', e);
      products = []; 
      return false;
    } 
  }
  
  function safeSave(){ 
    try {
      localStorage.setItem('pipchi_products', JSON.stringify(products));
      updateAdminStats();
      cleanAnalytics(); // NETTOYAGE AUTOMATIQUE
      return true;
    } catch (e) {
      console.error('Erreur sauvegarde produits:', e);
      alert('Erreur de sauvegarde des données');
      return false;
    }
  }

  function seedDemo(){
    if (products && products.length > 0) return;
    
    products = [
      { 
        id: uid(), 
        name: "Studio Photo Professionnel", 
        desc: "Pack complet studio photo avec éclairage LED et fond vert", 
        price: 89900, 
        stock: 3, 
        category: 'electronique',
        featured: true,
        images: [dataDemo],
        created: Date.now() 
      },
      { 
        id: uid(), 
        name: "Sneakers de Sport", 
        desc: "Chaussures de running légères et confortables", 
        price: 24900, 
        stock: 0, 
        category: 'vetements',
        featured: false,
        images: [dataDemo],
        created: Date.now() - 1000000 
      },
      { 
        id: uid(), 
        name: "Casquette PipChi Edition Limitée", 
        desc: "Casquette officielle avec logo brodé", 
        price: 12500, 
        stock: 15, 
        category: 'accessoires',
        featured: true,
        images: [dataDemo],
        created: Date.now() - 2000000 
      }
    ];
    safeSave();
  }

  function escapeHtml(s){ 
    if (!s) return '';
    return s.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sortProducts(list, sortBy) {
    const sorted = [...list];
    switch(sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'popular':
        const analytics = JSON.parse(localStorage.getItem('pipchi_analytics') || '{"products":{}}');
        return sorted.sort((a, b) => {
          const clicksA = analytics.products[a.id]?.clicks || 0;
          const clicksB = analytics.products[b.id]?.clicks || 0;
          return clicksB - clicksA;
        });
      case 'new':
      default:
        return sorted.sort((a, b) => (b.created || 0) - (a.created || 0));
    }
  }

  function updateAdminStats() {
    const totalProducts = products.length;
    const featuredCount = products.filter(p => p.featured).length;
    
    if (qs('#totalProducts')) qs('#totalProducts').textContent = totalProducts;
    if (qs('#featuredCount')) qs('#featuredCount').textContent = featuredCount;
    
    updateAnalyticsDisplay();
  }

  function renderProducts(list = products){
    const productGrid = qs('#productGrid');
    if (!productGrid) return;
    
    const q = qs('#search') ? qs('#search').value.trim().toLowerCase() : '';
    const categoryFilter = qs('#categoryFilter') ? qs('#categoryFilter').value : 'all';
    const sortBy = qs('#sortProducts') ? qs('#sortProducts').value : 'new';
    let out = [...list];

    // Filtre par catégorie
    if (categoryFilter !== 'all') {
      out = out.filter(p => p.category === categoryFilter);
    }

    const filterStock = qs('#filterStock') ? qs('#filterStock').value : 'all';
    if (filterStock === 'in') out = out.filter(p => p.stock > 0);
    if (filterStock === 'out') out = out.filter(p => p.stock <= 0);

    if (q) {
      out = out.filter(p => 
        (p.name + ' ' + p.desc).toLowerCase().includes(q)
      );
    }
    
    // Trier les produits
    out = sortProducts(out, sortBy);
    
    if (!out.length) {
      productGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">
          <p style="font-size:1.2rem;margin-bottom:8px">🔍 Aucun produit trouvé</p>
          <p>Essayez de modifier vos critères de recherche</p>
        </div>
      `;
      return;
    }

    productGrid.innerHTML = out.map(p => {
      const imageCount = p.images ? p.images.length : 1;
      const categoryName = categories[p.category] || '📦 Autres'; // CORRIGÉ : catégorie par défaut
      
      return `
        <article class="article-item ${p.featured ? 'featured' : ''} fade-in">
          <div class="product-image">
            <img src="${p.images ? p.images[0] : dataDemo}" alt="${escapeHtml(p.name)}" loading="lazy" />
            ${imageCount > 1 ? `<div class="image-count">+${imageCount - 1}</div>` : ''}
          </div>
          <h3>${escapeHtml(p.name)}</h3>
          <div class="product-category">${categoryName}</div>
          <p>${escapeHtml(p.desc)}</p>
          <div class="price-stock">
            <div class="price">${Number(p.price).toLocaleString()} F CFA</div>
            <div class="stock ${p.stock>0?'in':'out'}">${p.stock>0?('En stock — '+p.stock):'Rupture'}</div>
          </div>
          <div class="article-buttons">
            ${p.stock > 0 ? 
              `<button class="article-btn" data-product-id="${p.id}">Voir Détails</button>` : 
              `<button class="article-btn" style="background:var(--muted);cursor:not-allowed" disabled>Rupture de stock</button>`
            }
            ${imageCount > 1 ? `<button class="article-btn gallery" data-product-id="${p.id}">📷 Galerie</button>` : ''}
          </div>
        </article>
      `;
    }).join('');

    // Ajouter les event listeners - CORRIGÉ : vérification stock
    productGrid.querySelectorAll('.article-btn[data-product-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = btn.dataset.productId;
        const product = products.find(p => p.id === productId);
        if (!product) return;

        if (btn.classList.contains('gallery')) {
          // Bouton galerie
          if (product.images && product.images.length > 1) {
            alert(`Galerie d'images pour ${product.name} (${product.images.length} images)`);
          }
        } else {
          // Bouton "Voir Détails" - CORRIGÉ : vérification stock
          if (product.stock > 0) {
            trackProductClick(product.id, product.name);
            showRedirectPopup(product.name, 'https://oumistore.com/?page=boutique&boutiqueId=4518');
          } else {
            alert('❌ Ce produit est en rupture de stock');
          }
        }
      });
    });
  }

  /* ---------- GESTION ADMIN ---------- */
  function setupAdmin() {
    const adminBtn = qs('#adminBtn');
    const adminModal = qs('#adminModal');
    const closeAdmin = qs('#closeAdmin');
    const loginSection = qs('#loginSection');
    const adminPanel = qs('#adminPanel');
    const loginBtn = qs('#loginBtn');
    const adminPassword = qs('#adminPassword');
    const logoutBtn = qs('#logoutBtn');
    const cancelLogin = qs('#cancelLogin');

    // Onglets admin
    const adminTabs = qsa('.admin-tab');
    adminTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Mettre à jour les onglets actifs
        adminTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Afficher le contenu correspondant
        qsa('.admin-tab-content').forEach(content => {
          content.classList.remove('active');
        });
        const targetContent = qs(`#admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
        if (targetContent) targetContent.classList.add('active');
      });
    });

    function openAdmin(){ 
      if (adminModal) { 
        adminModal.classList.remove('hidden'); 
        adminModal.setAttribute('aria-hidden','false'); 
        document.body.style.overflow = 'hidden';
      } 
    }
    
    function closeAdminModal(){ 
      if (adminModal) { 
        adminModal.classList.add('hidden'); 
        adminModal.setAttribute('aria-hidden','true'); 
        if (loginSection) loginSection.classList.remove('hidden'); 
        if (adminPanel) adminPanel.classList.add('hidden'); 
        if (adminPassword) adminPassword.value = '';
        document.body.style.overflow = '';
      } 
    }

    if (adminBtn) adminBtn.addEventListener('click', openAdmin);
    if (closeAdmin) closeAdmin.addEventListener('click', closeAdminModal);
    if (cancelLogin) cancelLogin.addEventListener('click', closeAdminModal);

    // Fermer la modal en cliquant à l'extérieur
    if (adminModal) {
      adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) closeAdminModal();
      });
    }

    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        if (!adminPassword) return;
        const val = adminPassword.value.trim();
        
        if (val === ADMIN_PASSWORD) {
          if (loginSection) loginSection.classList.add('hidden');
          if (adminPanel) adminPanel.classList.remove('hidden');
          refreshAdminList();
          updateAdminStats();
          updateReviewsStats();
          renderReviews();
          updatePendingReviewsCount();
        } else {
          const errorEl = qs('#adminPasswordError');
          if (errorEl) {
            errorEl.textContent = 'Mot de passe incorrect';
            errorEl.classList.add('show');
          }
        }
      });
    }

    if (logoutBtn) logoutBtn.addEventListener('click', closeAdminModal);

    // Gestion du formulaire produit
    const productForm = qs('#productForm');
    const p_name = qs('#p_name');
    const p_desc = qs('#p_desc');
    const p_price = qs('#p_price');
    const p_stock = qs('#p_stock');
    const p_category = qs('#p_category');
    const p_featured = qs('#p_featured');
    const p_image = qs('#p_image');
    const p_id = qs('#p_id');
    const imagePreview = qs('#imagePreview');
    const descCount = qs('#descCount');
    const newProductBtn = qs('#newProduct');

    // Compteur de caractères description
    if (p_desc && descCount) {
      p_desc.addEventListener('input', () => {
        descCount.textContent = p_desc.value.length;
      });
    }

    // file to base64
    function fileToBase64(file){
      return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
    }

    // Preview images multiples
    if (p_image && imagePreview) {
      p_image.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files).slice(0, 5);
        imagePreview.innerHTML = '';
        
        for (const file of files) {
          if (!file.type.startsWith('image/')) continue;
          
          try {
            const imgData = await fileToBase64(file);
            const img = document.createElement('img');
            img.src = imgData;
            imagePreview.appendChild(img);
          } catch(err) {
            console.warn('Erreur lecture image', err);
          }
        }
      });
    }

    // product form submit
    if (productForm) {
      productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validation
        if (!p_name.value.trim() || !p_price.value || !p_stock.value || !p_category.value) {
          alert('Veuillez remplir les champs obligatoires (*)');
          return;
        }

        const id = p_id.value || uid();
        let imagesData = [];
        
        // Traiter les images multiples
        if (p_image && p_image.files && p_image.files.length > 0) {
          const files = Array.from(p_image.files).slice(0, 5);
          for (const file of files) {
            if (!file.type.startsWith('image/')) continue;
            try { 
              const imgData = await fileToBase64(file);
              imagesData.push(imgData);
            } catch(err){ 
              console.warn('Erreur lecture image', err);
            }
          }
        }
        
        const existingIdx = products.findIndex(x => x.id === id);
        const product = {
          id,
          name: p_name.value.trim(),
          desc: p_desc.value.trim(),
          price: Number(p_price.value) || 0,
          stock: Number(p_stock.value) || 0,
          category: p_category.value,
          featured: p_featured.checked,
          images: imagesData.length > 0 ? imagesData : (existingIdx >= 0 ? products[existingIdx].images : [dataDemo]),
          created: existingIdx >= 0 ? products[existingIdx].created : Date.now()
        };
        
        if (existingIdx >= 0) {
          products[existingIdx] = product;
        } else {
          products.unshift(product);
        }
        
        safeSave(); 
        renderProducts(); 
        refreshAdminList(); 
        productForm.reset(); 
        if (p_id) p_id.value = '';
        if (imagePreview) imagePreview.innerHTML = '';
        if (p_featured) p_featured.checked = false;
        if (descCount) descCount.textContent = '0';
        
        alert('✅ Produit enregistré avec succès !');
      });
    }

    if (newProductBtn) {
      newProductBtn.addEventListener('click', () => { 
        if (productForm) productForm.reset(); 
        if (p_id) p_id.value = ''; 
        if (imagePreview) imagePreview.innerHTML = '';
        if (p_featured) p_featured.checked = false;
        if (descCount) descCount.textContent = '0';
      });
    }

    // Export/Import
    const exportBtn = qs('#exportBtn');
    const importBtn = qs('#importBtn');
    const importFile = qs('#importFile');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const data = JSON.stringify(products, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); 
        a.href = url; 
        a.download = `pipchi_produits_${new Date().toISOString().split('T')[0]}.json`; 
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
      });
    }

    if (importBtn) importBtn.addEventListener('click', () => importFile && importFile.click());
    
    if (importFile) {
      importFile.addEventListener('change', (e) => {
        const f = e.target.files[0]; 
        if (!f) return;
        
        const r = new FileReader();
        r.onload = () => {
          try {
            const d = JSON.parse(r.result);
            if (Array.isArray(d)) { 
              if (confirm(`Importer ${d.length} produits ? Cela remplacera vos produits actuels.`)) {
                products = d; 
                safeSave(); 
                renderProducts(); 
                refreshAdminList(); 
                alert(`✅ ${d.length} produits importés avec succès !`); 
              }
            } else {
              alert('❌ Fichier JSON invalide');
            }
          } catch (err) { 
            alert('❌ Erreur : Fichier JSON corrompu ou invalide'); 
          }
        };
        r.readAsText(f);
        importFile.value = '';
      });
    }
  }

  function refreshAdminList(){
    const adminList = qs('#adminList');
    if (!adminList) return;
    
    if (!products.length) { 
      adminList.innerHTML = `
        <div style="color:var(--muted);text-align:center;padding:40px">
          <p>Aucun produit enregistré</p>
          <p style="font-size:12px;margin-top:8px">Commencez par ajouter votre premier produit</p>
        </div>
      `; 
      return; 
    }
    
    adminList.innerHTML = products.map(p => {
      const categoryName = categories[p.category] || '📦 Autres';
      return `
        <div class="admin-item">
          <img src="${p.images ? p.images[0] : dataDemo}" alt="${escapeHtml(p.name)}" />
          <div>
            <strong>${escapeHtml(p.name)}</strong>
            <div class="product-info">
              <span>${categoryName}</span>
              <span>${Number(p.price).toLocaleString()} F</span>
              <span>${p.stock} en stock</span>
              ${p.featured ? '<span>⭐ Phare</span>' : ''}
            </div>
          </div>
          <div>
            <button data-id="${p.id}" class="btn small btn-delete">🗑️ Supprimer</button>
          </div>
        </div>
      `;
    }).join('');

    // Event listeners pour les items admin
    adminList.querySelectorAll('.admin-item').forEach((item, index) => {
      const product = products[index];
      
      item.addEventListener('click', (ev) => {
        if (ev.target.tagName === 'BUTTON') return;
        loadToForm(product.id);
      });
      
      const delBtn = item.querySelector('.btn-delete');
      if (delBtn) {
        delBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if (!confirm(`Supprimer définitivement "${product.name}" ?`)) return;
          products = products.filter(x => x.id !== product.id);
          safeSave(); 
          renderProducts(); 
          refreshAdminList();
        });
      }
    });
  }

  function loadToForm(id){
    const p = products.find(x => x.id === id);
    if (!p) return;
    
    if (qs('#p_name')) qs('#p_name').value = p.name; 
    if (qs('#p_desc')) qs('#p_desc').value = p.desc; 
    if (qs('#p_price')) qs('#p_price').value = p.price; 
    if (qs('#p_stock')) qs('#p_stock').value = p.stock; 
    if (qs('#p_category')) qs('#p_category').value = p.category;
    if (qs('#p_featured')) qs('#p_featured').checked = p.featured || false;
    if (qs('#p_id')) qs('#p_id').value = p.id;
    
    if (qs('#descCount')) qs('#descCount').textContent = p.desc.length;
    
    // Afficher les images existantes
    const imagePreview = qs('#imagePreview');
    if (imagePreview) {
      imagePreview.innerHTML = '';
      if (p.images) {
        p.images.forEach(imgData => {
          const img = document.createElement('img');
          img.src = imgData;
          imagePreview.appendChild(img);
        });
      }
    }
  }

  /* ---------- GESTION DES FILTRES ---------- */
  function setupFilters() {
    const searchInput = qs('#search');
    const categoryFilter = qs('#categoryFilter');
    const filterStock = qs('#filterStock');
    const sortProducts = qs('#sortProducts');

    const updateProducts = () => renderProducts();

    if (searchInput) searchInput.addEventListener('input', updateProducts);
    if (categoryFilter) categoryFilter.addEventListener('change', updateProducts);
    if (filterStock) filterStock.addEventListener('change', updateProducts);
    if (sortProducts) sortProducts.addEventListener('change', updateProducts);
  }

  /* ---------- INITIALISATION ---------- */
  function init() {
    setupFormValidation();
    initReviews();
    initAnalytics();
    setupAdmin();
    setupFilters();
    
    safeLoad(); 
    seedDemo(); 
    renderProducts();
    updateAnalyticsDisplay();
    updateReviewsStats();

    console.log('✅ PipChi Boutique initialisé avec succès');
  }

  // Démarrer l'application
  init();

}); // DOMContentLoaded

// Cookies améliorés
const banner = document.getElementById("cookie-banner");
const btn = document.getElementById("acceptCookies");

// Fonction pour sauvegarder les préférences utilisateur
function saveUserPreferences() {
  const preferences = {
    theme: 'dark',
    language: 'fr',
    currency: 'F CFA'
  };
  localStorage.setItem('pipchi_preferences', JSON.stringify(preferences));
}

// Fonction pour charger les préférences utilisateur
function loadUserPreferences() {
  const preferences = JSON.parse(localStorage.getItem('pipchi_preferences') || '{}');
  // Appliquer les préférences...
}

if (!localStorage.getItem("cookiesAccepted")) {
  setTimeout(() => {
    if (banner) banner.style.display = "block";
  }, 2000);
} else {
  loadUserPreferences();
}

if (btn) {
  btn.addEventListener("click", () => {
    localStorage.setItem("cookiesAccepted", true);
    if (banner) banner.style.display = "none";
    saveUserPreferences();
  });
}
/* ---------- GALERIE D'IMAGES ---------- */
function openGallery(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.images || product.images.length === 0) return;
    
    const galleryModal = qs('#galleryModal');
    const galleryMainImage = qs('#galleryMainImage');
    const galleryProductName = qs('#galleryProductName');
    const galleryThumbnails = qs('#galleryThumbnails');
    
    if (!galleryModal || !galleryMainImage || !galleryProductName || !galleryThumbnails) return;
    
    // Mettre à jour le contenu
    galleryProductName.textContent = product.name;
    galleryMainImage.src = product.images[0];
    galleryMainImage.alt = product.name;
    
    // Créer les miniatures
    galleryThumbnails.innerHTML = '';
    product.images.forEach((image, index) => {
        const thumb = document.createElement('img');
        thumb.src = image;
        thumb.alt = `${product.name} - Image ${index + 1}`;
        thumb.classList.add(index === 0 ? 'active' : '');
        thumb.addEventListener('click', () => {
            // Mettre à jour l'image principale
            galleryMainImage.src = image;
            
            // Mettre à jour les miniatures actives
            galleryThumbnails.querySelectorAll('img').forEach(img => img.classList.remove('active'));
            thumb.classList.add('active');
        });
        galleryThumbnails.appendChild(thumb);
    });
    
    // Afficher la galerie
    galleryModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeGallery() {
    const galleryModal = qs('#galleryModal');
    if (galleryModal) {
        galleryModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Initialiser la galerie
function initGallery() {
    const closeGalleryBtn = qs('#closeGallery');
    const galleryModal = qs('#galleryModal');
    
    if (closeGalleryBtn) {
        closeGalleryBtn.addEventListener('click', closeGallery);
    }
    
    if (galleryModal) {
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) closeGallery();
        });
    }
    
    // Fermer avec ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !galleryModal.classList.contains('hidden')) {
            closeGallery();
        }
    });
}
/* ---------- PAGINATION ET RECHERCHE AVANCÉE ---------- */
let currentPage = 1;
const productsPerPage = 9;

function renderProducts(list = products) {
    const productGrid = qs('#productGrid');
    if (!productGrid) return;
    
    const q = qs('#search') ? qs('#search').value.trim().toLowerCase() : '';
    const categoryFilter = qs('#categoryFilter') ? qs('#categoryFilter').value : 'all';
    const filterStock = qs('#filterStock') ? qs('#filterStock').value : 'all';
    const sortBy = qs('#sortProducts') ? qs('#sortProducts').value : 'new';
    
    let filteredProducts = [...list];

    // Appliquer les filtres
    if (categoryFilter !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
    }

    if (filterStock === 'in') filteredProducts = filteredProducts.filter(p => p.stock > 0);
    if (filterStock === 'out') filteredProducts = filteredProducts.filter(p => p.stock <= 0);

    if (q) {
        filteredProducts = filteredProducts.filter(p => 
            (p.name + ' ' + p.desc + ' ' + p.category).toLowerCase().includes(q)
        );
    }
    
    // Trier les produits
    filteredProducts = sortProducts(filteredProducts, sortBy);
    
    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);
    
    // Afficher les résultats
    if (paginatedProducts.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">
                <p style="font-size:1.2rem;margin-bottom:8px">🔍 Aucun produit trouvé</p>
                <p>Essayez de modifier vos critères de recherche ou de réinitialiser les filtres</p>
                <button onclick="resetFilters()" class="btn ghost" style="margin-top:16px">🗑️ Réinitialiser les filtres</button>
            </div>
        `;
    } else {
        productGrid.innerHTML = paginatedProducts.map(p => {
            const imageCount = p.images ? p.images.length : 1;
            const categoryName = categories[p.category] || '📦 Autres';
            
            return `
                <article class="article-item ${p.featured ? 'featured' : ''} fade-in">
                    <div class="product-image">
                        <img src="${p.images ? p.images[0] : dataDemo}" alt="${escapeHtml(p.name)}" loading="lazy" />
                        ${imageCount > 1 ? `<div class="image-count">+${imageCount - 1}</div>` : ''}
                    </div>
                    <h3>${escapeHtml(p.name)}</h3>
                    <div class="product-category">${categoryName}</div>
                    <p>${escapeHtml(p.desc)}</p>
                    <div class="price-stock">
                        <div class="price">${Number(p.price).toLocaleString()} F CFA</div>
                        <div class="stock ${p.stock>0?'in':'out'}">${p.stock>0?('En stock — '+p.stock):'Rupture'}</div>
                    </div>
                    <div class="article-buttons">
                        ${p.stock > 0 ? 
                            `<button class="article-btn" data-product-id="${p.id}">Voir Détails</button>` : 
                            `<button class="article-btn" style="background:var(--muted);cursor:not-allowed" disabled>Rupture de stock</button>`
                        }
                        ${imageCount > 1 ? `<button class="article-btn gallery" data-product-id="${p.id}">📷 Galerie (${imageCount})</button>` : ''}
                    </div>
                </article>
            `;
        }).join('');

        // Ajouter la pagination
        productGrid.innerHTML += `
            <div style="grid-column:1/-1;text-align:center;margin-top:30px">
                <div class="pagination">
                    <button class="btn ghost ${currentPage === 1 ? 'disabled' : ''}" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                        ← Précédent
                    </button>
                    <span style="margin:0 16px;color:var(--muted)">
                        Page ${currentPage} sur ${totalPages}
                    </span>
                    <button class="btn ghost ${currentPage === totalPages ? 'disabled' : ''}" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                        Suivant →
                    </button>
                </div>
                <div style="margin-top:8px;color:var(--muted);font-size:14px">
                    ${filteredProducts.length} produit(s) trouvé(s)
                </div>
            </div>
        `;
    }

    // Event listeners pour les boutons
    setupProductEventListeners();
}

function setupProductEventListeners() {
    const productGrid = qs('#productGrid');
    if (!productGrid) return;
    
    productGrid.querySelectorAll('.article-btn[data-product-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = btn.dataset.productId;
            const product = products.find(p => p.id === productId);
            if (!product) return;

            if (btn.classList.contains('gallery')) {
                // Bouton galerie
                openGallery(product.id);
            } else {
                // Bouton "Voir Détails"
                if (product.stock > 0) {
                    trackProductClick(product.id, product.name);
                    showRedirectPopup(product.name, 'https://oumistore.com/?page=boutique&boutiqueId=4518');
                } else {
                    showNotification('❌ Ce produit est en rupture de stock', 'error');
                }
            }
        });
    });
}

function changePage(page) {
    const totalPages = Math.ceil(getFilteredProducts().length / productsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderProducts();
    
    // Scroll vers le haut des produits
    const productsSection = qs('#articles');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function getFilteredProducts() {
    const q = qs('#search') ? qs('#search').value.trim().toLowerCase() : '';
    const categoryFilter = qs('#categoryFilter') ? qs('#categoryFilter').value : 'all';
    const filterStock = qs('#filterStock') ? qs('#filterStock').value : 'all';
    
    let filtered = [...products];
    
    if (categoryFilter !== 'all') filtered = filtered.filter(p => p.category === categoryFilter);
    if (filterStock === 'in') filtered = filtered.filter(p => p.stock > 0);
    if (filterStock === 'out') filtered = filtered.filter(p => p.stock <= 0);
    if (q) filtered = filtered.filter(p => (p.name + ' ' + p.desc).toLowerCase().includes(q));
    
    return filtered;
}

function resetFilters() {
    if (qs('#search')) qs('#search').value = '';
    if (qs('#categoryFilter')) qs('#categoryFilter').value = 'all';
    if (qs('#filterStock')) qs('#filterStock').value = 'all';
    if (qs('#sortProducts')) qs('#sortProducts').value = 'new';
    
    currentPage = 1;
    renderProducts();
    
    showNotification('✅ Filtres réinitialisés', 'success');
}

// Fonction globale pour réinitialiser
window.resetFilters = resetFilters;
window.changePage = changePage;
/* ---------- SYSTÈME DE NOTIFICATIONS ---------- */
function showNotification(message, type = 'info') {
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">×</button>
        </div>
    `;
    
    // Styles pour la notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'var(--accent)' : type === 'success' ? 'var(--accent-2)' : 'var(--card-bg)'};
        color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Fermer la notification
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // Fermer automatiquement après 5 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Ajoutez ces animations dans le CSS
const notificationStyles = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.notification-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
}

.notification-close:hover {
    background: rgba(255,255,255,0.2);
}
`;

// Injecter les styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
