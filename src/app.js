const authPage = document.getElementById("authPage");
const bgMotion = document.getElementById("bgMotion");
const cursorGlow = document.getElementById("cursorGlow");

if (authPage && bgMotion && cursorGlow) {
  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!isReducedMotion) {
    authPage.addEventListener("pointermove", (event) => {
      const rect = authPage.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const offsetX = (event.clientX - centerX) / rect.width;
      const offsetY = (event.clientY - centerY) / rect.height;

      const moveX = `${(-offsetX * 20).toFixed(2)}px`;
      const moveY = `${(-offsetY * 20).toFixed(2)}px`;

      bgMotion.style.setProperty("--mx", moveX);
      bgMotion.style.setProperty("--my", moveY);
      cursorGlow.style.setProperty("--cx", `${event.clientX - rect.left}px`);
      cursorGlow.style.setProperty("--cy", `${event.clientY - rect.top}px`);
    });

    authPage.addEventListener("pointerleave", () => {
      bgMotion.style.setProperty("--mx", "0px");
      bgMotion.style.setProperty("--my", "0px");
      cursorGlow.style.setProperty("--cx", "50%");
      cursorGlow.style.setProperty("--cy", "50%");
    });
  }
}
