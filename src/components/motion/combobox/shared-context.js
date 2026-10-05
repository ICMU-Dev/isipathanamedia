import { createContext, useContext } from "react";

export const ComboboxContext = createContext(null);
export const ComboboxGroupContext = createContext(null);

export function useComboboxContext(component) {
  const context = useContext(ComboboxContext);
  if (!context) throw new Error(`${component} must be used within <Combobox>`);
  return context;
}

export function mergeRefs(...refs) {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object")
        (ref).current = node;
    }
  };
}

