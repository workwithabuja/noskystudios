const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#primary-menu");
const year = document.querySelector("[data-year]");
const contactForm = document.querySelector("[data-contact-form]");
const filterButtons = document.querySelectorAll("[data-filter]");
const portfolioItems = document.querySelectorAll("[data-category]");
const appearanceToggle = document.querySelector("[data-appearance-toggle]");
const hoverTargets = document.querySelectorAll(
  ".button, .icon-card, .portfolio-item, .project-chips span, .production-pipeline article"
);

const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

const getSavedTheme = () => {
  try {
    return localStorage.getItem("nosky-theme");
  } catch (error) {
    return null;
  }
};

const saveTheme = (theme) => {
  try {
    localStorage.setItem("nosky-theme", theme);
  } catch (error) {
    return;
  }
};

const getActiveTheme = () => {
  const savedTheme = getSavedTheme();
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }
  return systemTheme.matches ? "dark" : "light";
};

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  if (appearanceToggle) {
    const nextTheme = theme === "dark" ? "light" : "dark";
    appearanceToggle.setAttribute("aria-label", `Use ${nextTheme} appearance`);
    appearanceToggle.setAttribute("title", `Use ${nextTheme} appearance`);
  }
};

applyTheme(getActiveTheme());

if (year) {
  year.textContent = new Date().getFullYear();
}

if (appearanceToggle) {
  appearanceToggle.addEventListener("click", () => {
    const nextTheme = getActiveTheme() === "dark" ? "light" : "dark";
    saveTheme(nextTheme);
    applyTheme(nextTheme);
  });
}

systemTheme.addEventListener("change", () => {
  if (!getSavedTheme()) {
    applyTheme(getActiveTheme());
  }
});

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
  if (link.getAttribute("href") === currentPage) {
    link.setAttribute("aria-current", "page");
  }
});

const updateHeader = () => {
  if (siteHeader) {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
  }
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

  revealItems.forEach((item) => observer.observe(item));
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    portfolioItems.forEach((item) => {
      const shouldShow = filter === "all" || item.dataset.category === filter;
      item.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

hoverTargets.forEach((target) => {
  target.addEventListener("pointermove", (event) => {
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    target.style.setProperty("--mx", `${x}%`);
    target.style.setProperty("--my", `${y}%`);
  });
});

const newsletterForm = document.querySelector("[data-newsletter-form]");
if (newsletterForm) {
  const status = newsletterForm.querySelector("[data-newsletter-status]");
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!newsletterForm.checkValidity()) {
      newsletterForm.reportValidity();
      return;
    }
    newsletterForm.reset();
    if (status) {
      status.textContent = "You're on the list. We'll keep you updated.";
      status.classList.add("is-visible");
    }
  });
}

if (contactForm) {
  const status = contactForm.querySelector("[data-form-status]");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      if (status) {
        status.textContent = "Please complete the required fields correctly.";
        status.classList.add("is-visible");
      }
      contactForm.reportValidity();
      return;
    }

    contactForm.reset();
    if (status) {
      status.textContent = "Thanks. This form is ready to connect to a form service later.";
      status.classList.add("is-visible");
    }
  });
}
