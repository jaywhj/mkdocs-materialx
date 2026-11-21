/* Shared text-avatar helpers used by Blog and Document Dates. */
(() => {
  function isLatin(name) {
    return /^[A-Za-z\s]+$/.test(name.trim());
  }

  function extractInitials(name) {
    name = name.trim();
    if (!name) return "?";
    if (isLatin(name)) {
      const parts = name.toUpperCase().split(/\s+/).filter(Boolean);
      return parts.length >= 2
        ? parts[0][0] + parts[parts.length - 1][0]
        : parts[0][0];
    }
    return name[0];
  }

  function nameToHSL(name, saturation = 50, lightness = 55) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, ${saturation}%, ${lightness}%)`;
  }

  function renderInitials(root = document) {
    root.querySelectorAll(".avatar-wrapper").forEach(wrapper => {
      const name = wrapper.dataset.name || "";
      const text = wrapper.querySelector(".avatar-text");
      if (!text) return;
      text.textContent = extractInitials(name);
      text.style.backgroundColor = nameToHSL(name);
    });
  }

  window.ddAvatar = Object.freeze({
    extractInitials,
    nameToHSL,
    renderInitials
  });

  if (window.document$ && !window.document$.isStopped) {
    window.document$.subscribe(() => renderInitials());
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => renderInitials());
  } else {
    renderInitials();
  }
})();
