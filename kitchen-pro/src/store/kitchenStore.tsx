import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { FreezerItem } from "../types/freezer";

type KitchenState = {
  freezer: FreezerItem[];
};

type Action =
  | { type: "FREEZER_ADD"; item: FreezerItem }
  | { type: "FREEZER_REMOVE"; id: string }
  | { type: "FREEZER_SET"; items: FreezerItem[] };

const STORAGE_KEY = "kitchen-pro:v1";

const initialState: KitchenState = {
  freezer: [],
};

function reducer(state: KitchenState, action: Action): KitchenState {
  switch (action.type) {
    case "FREEZER_ADD":
      return { ...state, freezer: [action.item, ...state.freezer] };
    case "FREEZER_REMOVE":
      return { ...state, freezer: state.freezer.filter((x) => x.id !== action.id) };
    case "FREEZER_SET":
      return { ...state, freezer: action.items };
    default:
      return state;
  }
}

function loadState(): KitchenState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as KitchenState;
    if (!parsed || !Array.isArray(parsed.freezer)) return initialState;
    return parsed;
  } catch {
    return initialState;
  }
}

function saveState(state: KitchenState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode issues
  }
}

type KitchenStore = {
  state: KitchenState;
  addFreezerItem: (item: FreezerItem) => void;
  removeFreezerItem: (id: string) => void;
  replaceFreezer: (items: FreezerItem[]) => void;
};

const KitchenContext = createContext<KitchenStore | null>(null);

export function KitchenProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const store = useMemo<KitchenStore>(() => {
    return {
      state,
      addFreezerItem: (item) => dispatch({ type: "FREEZER_ADD", item }),
      removeFreezerItem: (id) => dispatch({ type: "FREEZER_REMOVE", id }),
      replaceFreezer: (items) => dispatch({ type: "FREEZER_SET", items }),
    };
  }, [state]);

  return <KitchenContext.Provider value={store}>{children}</KitchenContext.Provider>;
}

export function useKitchen() {
  const ctx = useContext(KitchenContext);
  if (!ctx) throw new Error("useKitchen must be used within KitchenProvider");
  return ctx;
}
