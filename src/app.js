const authCard = document.getElementById("authCard");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginPanel = document.getElementById("loginPanel");
const registerPanel = document.getElementById("registerPanel");
const toast = document.getElementById("toast");
const networkCanvas = document.getElementById("networkCanvas");

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
};

const setActivePanel = (panel) => {
  const isLogin = panel === "login";

  loginTab.classList.toggle("active", isLogin);
  loginTab.setAttribute("aria-selected", String(isLogin));

  registerTab.classList.toggle("active", !isLogin);
  registerTab.setAttribute("aria-selected", String(!isLogin));

  loginPanel.classList.toggle("active", isLogin);
  loginPanel.hidden = !isLogin;

  registerPanel.classList.toggle("active", !isLogin);
  registerPanel.hidden = isLogin;

  authCard.classList.toggle("register-mode", !isLogin);
};

loginTab.addEventListener("click", () => setActivePanel("login"));
registerTab.addEventListener("click", () => setActivePanel("register"));

[loginPanel, registerPanel].forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = form.id === "loginPanel" ? "Inicio de sesión simulado ✨" : "Usuario creado correctamente ✨";
    showToast(message);
  });
});

if (authCard) {
  const damp = (value, amount = 15) => value / amount;

  document.addEventListener("mousemove", (event) => {
    const { innerWidth, innerHeight } = window;
    const xRatio = event.clientX / innerWidth - 0.5;
    const yRatio = event.clientY / innerHeight - 0.5;
    authCard.style.transform = `rotateX(${damp(-yRatio * 8)}deg) rotateY(${damp(xRatio * 10)}deg)`;
  });

  document.addEventListener("mouseleave", () => {
    authCard.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

if (networkCanvas) {
  const ctx = networkCanvas.getContext("2d");
  let width = 0;
  let height = 0;
  const mouse = { x: -9999, y: -9999, active: false };
  const nodeCount = 44;
  const linkDistance = 210;

  const typeColors = {
    colegio: "rgba(74, 150, 178, 0.86)",
    familia: "rgba(77, 128, 187, 0.86)",
    producto: "rgba(88, 171, 164, 0.86)",
  };

  const labels = ["colegio", "familia", "producto"];

  const nodes = Array.from({ length: nodeCount }, (_, index) => {
    const kind = labels[index % labels.length];
    return {
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 2.4 + Math.random() * 1.2,
      kind,
      pulse: Math.random() * Math.PI * 2,
    };
  });

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    networkCanvas.width = Math.floor(width * dpr);
    networkCanvas.height = Math.floor(height * dpr);
    networkCanvas.style.width = `${width}px`;
    networkCanvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    nodes.forEach((node) => {
      if (!node.x || !node.y) {
        node.x = Math.random() * width;
        node.y = Math.random() * height;
      }
    });
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < linkDistance) {
          const opacity = (1 - dist / linkDistance) * 0.62;
          ctx.strokeStyle = `rgba(94, 151, 188, ${opacity})`;
          ctx.lineWidth = 1.05;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((node) => {
      node.pulse += 0.028;
      const pulseRadius = node.radius + Math.sin(node.pulse) * 0.32;
      ctx.fillStyle = typeColors[node.kind];
      ctx.beginPath();
      ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = "rgba(165, 208, 213, 0.62)";
      ctx.lineWidth = 1;
      ctx.arc(node.x, node.y, pulseRadius + 2.3, 0, Math.PI * 2);
      ctx.stroke();
    });
  };

  const update = () => {
    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x <= 0 || node.x >= width) node.vx *= -1;
      if (node.y <= 0 || node.y >= height) node.vy *= -1;

      if (mouse.active) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 150 && dist > 0.001) {
          const force = (150 - dist) / 150;
          node.vx -= (dx / dist) * force * 0.02;
          node.vy -= (dy / dist) * force * 0.02;
        }
      }

      node.vx *= 0.993;
      node.vy *= 0.993;

      if (node.vx > 0.4) node.vx = 0.4;
      if (node.vx < -0.4) node.vx = -0.4;
      if (node.vy > 0.4) node.vy = 0.4;
      if (node.vy < -0.4) node.vy = -0.4;
    });
  };

  const animate = () => {
    update();
    draw();
    requestAnimationFrame(animate);
  };

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
  });
  window.addEventListener("mouseout", () => {
    mouse.active = false;
  });

  resize();
  animate();
}
