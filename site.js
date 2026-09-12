const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reducedMotion && "IntersectionObserver" in window) {
  const sections = document.querySelectorAll(".section, .domain-strip");
  sections.forEach((section) => section.classList.add("reveal"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  sections.forEach((section) => observer.observe(section));
}
