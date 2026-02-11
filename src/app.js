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
  setTimeout(() => toast.classList.remove("show"), 1700);
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
  const damp = (value, amount = 14) => value / amount;

  document.addEventListener("mousemove", (event) => {
    const { innerWidth, innerHeight } = window;
    const xRatio = event.clientX / innerWidth - 0.5;
    const yRatio = event.clientY / innerHeight - 0.5;
    authCard.style.transform = `rotateX(${damp(-yRatio * 10)}deg) rotateY(${damp(xRatio * 12)}deg)`;
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
  const nodeCount = 36;
  const linkDistance = 180;

  const typeColors = {
    colegio: "rgba(91, 128, 205, 0.95)",
    familia: "rgba(127, 158, 220, 0.95)",
    producto: "rgba(157, 184, 238, 0.95)",
  };

  const labels = ["colegio", "familia", "producto"];

  const nodes = Array.from({ length: nodeCount }, (_, index) => {
    const kind = labels[index % labels.length];
    return {
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.34,
      radius: 2.2 + Math.random() * 1.4,
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
          const opacity = (1 - dist / linkDistance) * 0.5;
          ctx.strokeStyle = `rgba(120, 151, 223, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((node) => {
      node.pulse += 0.03;
      const pulseRadius = node.radius + Math.sin(node.pulse) * 0.35;
      ctx.fillStyle = typeColors[node.kind];
      ctx.beginPath();
      ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = "rgba(181, 202, 245, 0.55)";
      ctx.lineWidth = 1;
      ctx.arc(node.x, node.y, pulseRadius + 2.2, 0, Math.PI * 2);
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
        if (dist < 140 && dist > 0.001) {
          const force = (140 - dist) / 140;
          node.vx -= (dx / dist) * force * 0.02;
          node.vy -= (dy / dist) * force * 0.02;
        }
      }

      node.vx *= 0.992;
      node.vy *= 0.992;

      if (node.vx > 0.42) node.vx = 0.42;
      if (node.vx < -0.42) node.vx = -0.42;
      if (node.vy > 0.42) node.vy = 0.42;
      if (node.vy < -0.42) node.vy = -0.42;
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
