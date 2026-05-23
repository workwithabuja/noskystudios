import { injectSpeedInsights } from './speed-insights.js';

// Initialize Vercel Speed Insights
injectSpeedInsights();

const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#primary-menu");
const year = document.querySelector("[data-year]");
const contactForm = document.querySelector("[data-contact-form]");

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navMenu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      navToggle.setAttribute("aria-expanded", "false");
      navMenu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    }
  });
}

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll("[data-nav-link]").forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPage || (currentPage === "" && href === "index.html")) {
    link.setAttribute("aria-current", "page");
  }
});

const updateHeader = () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
};
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealItems = document.querySelectorAll("[data-reveal]");

if (motionQuery.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  document.documentElement.classList.add("reveal-enabled");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      item.classList.add("is-visible");
      return;
    }
    observer.observe(item);
  });
}

if (contactForm) {
  const status = contactForm.querySelector("[data-form-status]");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    contactForm.reset();
    if (status) {
      status.textContent = "Thanks. Your message is ready for a future form handler.";
      status.classList.add("is-visible");
    }
  });
}
