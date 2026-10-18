(function () {
  const root = document.documentElement;
  root.classList.add("js");

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  const navLabel = toggle.querySelector(".sr-only");
  const year = document.querySelector("#year");
  const form = document.querySelector(".contact-form");

  year.textContent = String(new Date().getFullYear());

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const mobileQuery = window.matchMedia("(max-width: 760px)");

  const setMenu = (open) => {
    const isOpen = open && mobileQuery.matches;
    toggle.setAttribute("aria-expanded", String(isOpen));
    navLabel.textContent = isOpen ? "메뉴 닫기" : "메뉴 열기";
    nav.classList.toggle("is-open", isOpen);
    nav.inert = mobileQuery.matches && !isOpen;
    document.body.classList.toggle("menu-open", isOpen);
  };

  toggle.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  mobileQuery.addEventListener("change", () => setMenu(false));
  setMenu(false);

  const links = [...nav.querySelectorAll("a")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.toggleAttribute("data-current", entry.isIntersecting);
        });
        const current = sections.find((section) => section.hasAttribute("data-current"));
        links.forEach((link) => {
          link.classList.toggle(
            "is-active",
            Boolean(current) && link.getAttribute("href") === `#${current.id}`
          );
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 }
    );
    sections.forEach((section) => observer.observe(section));
  }

  const rules = [
    {
      id: "name",
      message: "이름은 두 글자 이상 입력해 주세요.",
      test: (value) => value.trim().length >= 2,
    },
    {
      id: "email",
      message: "이메일 주소를 확인해 주세요.",
      test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    },
    {
      id: "message",
      message: "메시지는 10자 이상 적어 주세요.",
      test: (value) => value.trim().length >= 10,
    },
  ];

  const showError = (id, message) => {
    const input = form.querySelector(`#${id}`);
    const error = form.querySelector(`#${id}-error`);
    input.setAttribute("aria-invalid", message ? "true" : "false");
    input.setAttribute("aria-describedby", `${id}-error`);
    error.textContent = message;
  };

  rules.forEach((rule) => {
    const input = form.querySelector(`#${rule.id}`);
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true") {
        showError(rule.id, rule.test(input.value) ? "" : rule.message);
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let firstInvalid = null;

    rules.forEach((rule) => {
      const input = form.querySelector(`#${rule.id}`);
      const valid = rule.test(input.value);
      showError(rule.id, valid ? "" : rule.message);
      if (!valid && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const name = form.querySelector("#name").value.trim();
    const success = form.querySelector(".form-success");
    success.querySelector(".success-body").textContent =
      `${name}님, 메시지를 확인했습니다. 이 페이지는 정적 사이트라 메일함으로는 전달되지 않습니다.`;
    form.classList.add("is-sent");
    success.hidden = false;
    success.querySelector("[data-reset]").focus();
  });

  form.querySelector("[data-reset]").addEventListener("click", () => {
    form.reset();
    rules.forEach((rule) => showError(rule.id, ""));
    form.classList.remove("is-sent");
    form.querySelector(".form-success").hidden = true;
    form.querySelector("#name").focus();
  });
})();
