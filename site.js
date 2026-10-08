const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reducedMotion && "IntersectionObserver" in window) {
  const sections = document.querySelectorAll(".section, .domain-strip");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
  sections.forEach((section) => {
    section.classList.add("reveal");
    observer.observe(section);
  });
}

const search = document.querySelector("#insight-search");
if (search) {
  const cards = [...document.querySelectorAll("#insight-list .insight-card")];
  const count = document.querySelector("#insight-count");
  const update = () => {
    const query = search.value.trim().toLocaleLowerCase("en");
    let matches = 0;
    cards.forEach((card) => {
      card.hidden = !card.textContent.toLocaleLowerCase("en").includes(query);
      if (!card.hidden) matches++;
    });
    count.textContent = matches ? `${matches} of ${cards.length} notes` : "No matches. Try another keyword.";
  };
  search.closest(".insights-search").hidden = false;
  search.addEventListener("input", update);
  update();
}

const links = [...document.querySelectorAll('nav[aria-label="Primary navigation"] a[href^="#"]')];
if (links.length) {
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  let scheduled = false;
  const updateNavigation = () => {
    const header = document.querySelector(".site-header");
    const offset = header.getBoundingClientRect().height + 32;
    let active = null;
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset) active = section.id;
    });
    links.forEach((link) => {
      if (link.getAttribute("href") === "#" + active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    scheduled = false;
  };
  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateNavigation);
    }
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  updateNavigation();
}
