const authCard = document.getElementById("authCard");
const newUserBtn = document.getElementById("newUserBtn");
const submitBtn = document.getElementById("submitBtn");
const extraFields = document.getElementById("extraFields");
const authForm = document.getElementById("authForm");

let isRegisterMode = false;

const setRegisterMode = (enabled) => {
  isRegisterMode = enabled;
  authCard.classList.toggle("expanded", enabled);
  extraFields.setAttribute("aria-hidden", String(!enabled));
  submitBtn.textContent = enabled ? "Registrar cuenta" : "Continuar";
  newUserBtn.textContent = enabled ? "Ocultar registro" : "Crear nuevo usuario";

  extraFields.querySelectorAll("input, select").forEach((field) => {
    if (enabled) {
      field.setAttribute("required", "required");
    } else {
      field.removeAttribute("required");
      field.value = "";
    }
  });
};

newUserBtn.addEventListener("click", () => {
  setRegisterMode(!isRegisterMode);
});

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
});
