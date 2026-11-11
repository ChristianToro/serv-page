/* =========================================================
   Config (PLAN.md 6.1). Fill {{TOKENS}} here AND in index.html hrefs,
   so mailto links also work with JS off.
   ========================================================= */
const CONTACT = {
  email: "{{CONTACT_EMAIL}}",
  defaultSubject: "Question about help for my shop",
  bodyTemplate: "Shop name:\nHow customers reach us now (text, DMs, calls):\nWhat keeps going wrong:\n"
};

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canObserve = "IntersectionObserver" in window;

/* ---------------------------------------------------------
   mailto links: one builder for every [data-mailto]
   --------------------------------------------------------- */
function mailtoHref(subject) {
  return "mailto:" + CONTACT.email +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(CONTACT.bodyTemplate);
}

document.querySelectorAll("[data-mailto]").forEach((link) => {
  const tier = link.dataset.tier;
  const subject = tier ? "Question about the " + tier + " package" : CONTACT.defaultSubject;
  link.href = mailtoHref(subject);
});

/* ---------------------------------------------------------
   Copy email button (PLAN.md 6.2)
   --------------------------------------------------------- */
document.querySelectorAll("[data-copy-target]").forEach((button) => {
  const target = document.getElementById(button.dataset.copyTarget);
  const status = button.parentElement.querySelector("[data-copy-status]");
  if (!target) return;
  const label = button.textContent;
  let timer;

  const selectAddress = () => {
    const range = document.createRange();
    range.selectNodeContents(target);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  button.hidden = false;
  button.addEventListener("click", async () => {
    const text = target.textContent.trim();
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      button.textContent = "Copied";
      if (status) status.textContent = "Copied";
      clearTimeout(timer);
      timer = setTimeout(() => {
        button.textContent = label;
        if (status) status.textContent = "";
      }, 2000);
    } catch {
      selectAddress();
      if (status) status.textContent = "Email address selected";
    }
  });
});

/* ---------------------------------------------------------
   Smooth anchor scrolling is for pointer clicks; while the visitor moves
   with Tab, focus scrolls instantly so it never sits off-screen.
   --------------------------------------------------------- */
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") root.classList.add("is-keyboard");
});
document.addEventListener("pointerdown", () => root.classList.remove("is-keyboard"));

/* ---------------------------------------------------------
   Header: compact once the hero is scrolled past (PLAN.md 6.3)
   --------------------------------------------------------- */
const header = document.querySelector(".site-header");
const sentinel = document.querySelector(".header-sentinel");

if (header && sentinel && canObserve) {
  new IntersectionObserver(([entry]) => {
    const past = !entry.isIntersecting && entry.boundingClientRect.top < window.innerHeight / 2;
    header.classList.toggle("is-compact", past);
  }).observe(sentinel);
}

/* ---------------------------------------------------------
   Reveals and the before/after sequence (PLAN.md 4.5)
   Skipped entirely under reduced motion or without IntersectionObserver,
   so content simply renders in its final state.
   --------------------------------------------------------- */
const REVEAL_SELECTOR = [
  "main > section:not(.hero) .section-label",
  "main > section:not(.hero) h2:not(.section-label)",
  ".problem__list > li",
  ".plain p:not(.section-label)",
  ".service",
  ".pricing__intro",
  ".tier",
  ".pricing__help",
  ".contact .wrap > p",
  ".contact .btn--big",
  ".contact__address"
].join(",");

function inView(el) {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
}

if (canObserve && !reduceMotion.matches) {
  const revealables = [...document.querySelectorAll(REVEAL_SELECTOR)];
  const tracks = document.querySelector(".flow__tracks");

  // Anything already on screen at load starts in its final state (no flash).
  revealables.forEach((el) => {
    el.setAttribute("data-reveal", "");
    if (inView(el)) el.classList.add("is-visible", "is-done");
  });

  if (tracks) {
    tracks.querySelectorAll("ol").forEach((list) => {
      [...list.children].forEach((li, i) => li.style.setProperty("--i", i));
    });
    tracks.setAttribute("data-seq", "");
    if (inView(tracks)) tracks.classList.add("is-playing");
  }

  root.classList.add("js");

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("is-visible");
      el.addEventListener("transitionend", (e) => {
        if (e.target === el && e.propertyName === "clip-path") el.classList.add("is-done");
      });
      observer.unobserve(el);
    });
  }, {
    // Chrome counts the target's own clip-path in intersectionRatio, so a fully
    // clipped element never reaches a ratio threshold. Fire on the edge instead,
    // once it is 20% of the viewport up from the bottom (PLAN.md 4.5 "about 0.2").
    threshold: 0,
    rootMargin: "0px 0px -20% 0px"
  });

  revealables.forEach((el) => {
    if (!el.classList.contains("is-visible")) revealObserver.observe(el);
  });

  // Keyboard users can Tab into a block before it is scrolled into reveal
  // range: show it at once so focus never lands on something hidden.
  document.addEventListener("focusin", (e) => {
    const block = e.target.closest?.("[data-reveal]:not(.is-visible)");
    if (!block) return;
    block.classList.add("is-visible", "is-done");
    revealObserver.unobserve(block);
  });

  if (tracks && !tracks.classList.contains("is-playing")) {
    const flowObserver = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      tracks.classList.add("is-playing");
      observer.disconnect();
    }, { threshold: 0.3 });
    flowObserver.observe(tracks);
  }
} else {
  // Still mark JS as present for non-motion styling hooks.
  root.classList.add("js");
}

// If the user turns on reduced motion mid-visit, finish every reveal now.
reduceMotion.addEventListener?.("change", (e) => {
  if (!e.matches) return;
  document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible", "is-done"));
  document.querySelector(".flow__tracks")?.classList.add("is-playing");
});
