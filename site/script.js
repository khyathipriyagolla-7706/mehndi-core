/* =====================================================
   MOBILE MENU
   ===================================================== */
(function(){
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if(!menuToggle || !mobileMenu) return;

  menuToggle.addEventListener("click", function(){
    const isOpen = mobileMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    menuToggle.textContent = isOpen ? "×" : "☰";
  });

  mobileMenu.querySelectorAll("a").forEach(function(link){
    link.addEventListener("click", function(){
      mobileMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
      menuToggle.textContent = "☰";
    });
  });
})();

/* =====================================================
   FAQ ACCORDION
   ===================================================== */
(function(){
  const faqItems = document.querySelectorAll(".faq-item");
  if(!faqItems.length) return;

  faqItems.forEach(function(item){
    const q = item.querySelector(".faq-q");
    q.addEventListener("click", function(){
      const wasOpen = item.classList.contains("open");
      faqItems.forEach(function(other){ other.classList.remove("open"); });
      if(!wasOpen){ item.classList.add("open"); }
    });
  });
})();

/* =====================================================
   GALLERY: FILTER + LIGHTBOX
   ===================================================== */
(function(){
  const grid = document.getElementById("galleryGrid");
  if(!grid) return;

  const filters = document.querySelectorAll(".gallery-filter");
  const items = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  filters.forEach(function(btn){
    btn.addEventListener("click", function(){
      filters.forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
      const cat = btn.getAttribute("data-filter");

      items.forEach(function(item){
        const match = cat === "all" || item.getAttribute("data-cat") === cat;
        item.style.display = match ? "" : "none";
      });
    });
  });

  items.forEach(function(item){
    item.addEventListener("click", function(){
      const img = item.querySelector("img");
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add("open");
    });
  });

  function closeLightbox(){ lightbox.classList.remove("open"); }
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function(e){
    if(e.target === lightbox){ closeLightbox(); }
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape"){ closeLightbox(); }
  });
})();
