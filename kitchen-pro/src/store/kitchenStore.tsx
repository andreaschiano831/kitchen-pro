import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { FreezerItem } from "../types/freezer";

type Kitchen = {
  id: string;
  name: string;
  freezer: FreezerItem[];
};

type KitchenState = {
  currentKitchenId: string | null;
  kitchens: Kitchen[];
};

type Action =
  | { type: "KITCHEN_CREATE"; kitchen: Kitchen }
  | { type: "KITCHEN_SELECT"; id: string }
  | { type: "FREEZER_ADD"; item: FreezerItem }
  | { type: "FREEZER_REMOVE"; id: string };

const STORAGE_KEY = "kitchen-pro:v2";

const initialState: KitchenState = {
  currentKitchenId: null,
  kitchens: [],
};

function reducer(state: KitchenState, action: Action): KitchenState {
  switch (action.type) {
    case "KITCHEN_CREATE":
      return {
        ...state,
        kitchens: [...state.kitchens, action.kitchen],
        currentKitchenId: action.kitchen.id,
      };

    case "KITCHEN_SELECT":
      return { ...state, currentKitchenId: action.id };

    case "FREEZER_ADD":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === state.currentKitchenId ? { ...k, freezer: [action.item, ...k.freezer] } : k
        ),
      };

    case "FREEZER_REMOVE":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === state.currentKitchenId
            ? { ...k, freezer: k.freezer.filter((x) => x.id !== action.id) }
            : k
        ),
      };

    default:
      return state;
  }
}

function loadState(): KitchenState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as KitchenState;
    if (!parsed || !Array.isArray(parsed.kitchens)) return initialState;
    return parsed;
  } catch {
    return initialState;
  }
}

function saveState(state: KitchenState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

type KitchenStore = {
  state: KitchenState;
  createKitchen: (name: string) => void;
  selectKitchen: (id: string) => void;
  addFreezerItem: (item: FreezerItem) => void;
  removeFreezerItem: (id: string) => void;
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
      createKitchen: (name) => {
        const id = crypto.randomUUID();
        dispatch({ type: "KITCHEN_CREATE", kitchen: { id, name, freezer: [] } });
      },
      selectKitchen: (id) => dispatch({ type: "KITCHEN_SELECT", id }),
      addFreezerItem: (item) => dispatch({ type: "FREEZER_ADD", item }),
      removeFreezerItem: (id) => dispatch({ type: "FREEZER_REMOVE", id }),
    };
  }, [state]);

  return <KitchenContext.Provider value={store}>{children}</KitchenContext.Provider>;
}

export function useKitchen() {
  const ctx = useContext(KitchenContext);
  if (!ctx) throw new Error("useKitchen must be used within KitchenProvider");
  return ctx;
}
