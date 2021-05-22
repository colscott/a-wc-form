export const textInputBinder = {
  controlSelector: "input, textarea",
  initializeEvents: (control, onChange) =>
    control.addEventListener("change", e => {
      onChange(e.target.value);
    }),
  writeValue: (control, value) => {
    control.value = value;
  }
};

export const numberInputBinder = {
  controlSelector: "input[type=number]",
  initializeEvents: (control, onChange) =>
    control.addEventListener("change", e => {
      onChange(+e.target.value);
    }),
  writeValue: (control, value) => {
    control.value = value;
  }
};

export const checkboxInputBinder = {
  controlSelector: "input[type='checkbox']",
  initializeEvents: (control, onChange) =>
    control.addEventListener("change", e => {
      onChange(e.target.checked);
    }),
  writeValue: (control, value) => {
    control.checked = value;
  }
};

export const selectBinder = {
  controlSelector: "select",
  initializeEvents: (control, onChange) =>
    control.addEventListener("change", e => {
      const value = Array.from(
        /** @type {HTMLSelectElement} */ (e.target).selectedOptions
      )
        .map(i => i.value)
        .join(",");
      onChange(value);
    }),
  writeValue: (control, value) => {
    control.value = value;
  }
};
