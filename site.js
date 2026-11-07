const search = document.querySelector("#insight-search");
if (search) {
  const cards = [...document.querySelectorAll("#insight-list .insight-card")];
  const count = document.querySelector("#insight-count");
  const more = document.querySelector("#insights-more");
  const initialVisible = 6;
  let expanded = false;
  const update = () => {
    const query = search.value.trim().toLocaleLowerCase("en");
    let matches = 0;
    cards.forEach((card, index) => {
      const matchesQuery = card.textContent.toLocaleLowerCase("en").includes(query);
      card.hidden = !matchesQuery || (!query && !expanded && index >= initialVisible);
      if (matchesQuery) matches++;
    });
    if (!matches) count.textContent = "No matches. Try another keyword.";
    else if (query) count.textContent = `${matches} of ${cards.length} articles`;
    else count.textContent = expanded ? `${cards.length} articles` : `Showing ${Math.min(initialVisible, cards.length)} of ${cards.length} articles`;
    more.hidden = Boolean(query) || expanded || cards.length <= initialVisible;
  };
  search.closest(".insights-search").hidden = false;
  search.addEventListener("input", update);
  more.textContent = `Show all ${cards.length} articles`;
  more.addEventListener("click", () => {
    expanded = true;
    update();
    cards[initialVisible]?.focus();
  });
  update();
}

const links = [...document.querySelectorAll('.site-header nav a[href^="#"]')];
if (links.length) {
  const sections = [...new Set(links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean))];
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

const mobileNavigation = document.querySelector(".mobile-nav");
mobileNavigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => mobileNavigation.removeAttribute("open"));
});
document.addEventListener("click", (event) => {
  if (mobileNavigation?.open && !mobileNavigation.contains(event.target)) mobileNavigation.removeAttribute("open");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileNavigation?.open) {
    mobileNavigation.removeAttribute("open");
    mobileNavigation.querySelector("summary")?.focus();
  }
});
