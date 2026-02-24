import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { v4 as uuid } from "uuid";
import type { FreezerItem, Unit } from "../types/freezer";

export type Role =
  | "admin"
  | "chef"
  | "sous-chef"
  | "capo-partita"
  | "commis"
  | "stagista"
  | "fb"
  | "mm"
  | "staff";

export type Member = {
  id: string;
  name: string;
  role: Role;
};

export type ShoppingCategory = "economato" | "giornaliero" | "settimanale";

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  category: ShoppingCategory;
  checked: boolean;
  createdAt: string; // ISO
  notes?: string;
};

export type Kitchen = {
  id: string;
  name: string;
  members: Member[];
  freezer: FreezerItem[];
  shopping: ShoppingItem[];
};

export type KitchenState = {
  currentKitchenId: string | null;
  currentUserId: string | null;
  kitchens: Kitchen[];
};

type Action =
  | { type: "KITCHEN_CREATE"; name: string; ownerName: string; ownerRole: Role }
  | { type: "KITCHEN_SELECT"; id: string }
  | { type: "USER_SELECT"; userId: string }
  | { type: "ADD_MEMBER"; kitchenId: string; member: Member }
  | { type: "UPDATE_MEMBER_ROLE"; kitchenId: string; memberId: string; role: Role }
  | { type: "REMOVE_MEMBER"; kitchenId: string; memberId: string }
  | { type: "FREEZER_ADD"; item: FreezerItem }
  | { type: "FREEZER_REMOVE"; id: string }
  | { type: "FREEZER_ADJUST"; id: string; delta: number }
  | { type: "FREEZER_SET_PARLEVEL"; id: string; parLevel?: number }
  | { type: "SHOP_ADD"; item: ShoppingItem }
  | { type: "SHOP_TOGGLE"; id: string }
  | { type: "SHOP_REMOVE"; id: string }
  | { type: "SHOP_CLEAR_CHECKED"; category: ShoppingCategory };

const STORAGE_KEY = "kitchen-pro:v1";

function loadInitial(): KitchenState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { currentKitchenId: null, currentUserId: null, kitchens: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { currentKitchenId: null, currentUserId: null, kitchens: [] };
    if (!Array.isArray((parsed as any).kitchens)) return { currentKitchenId: null, currentUserId: null, kitchens: [] };

    const kitchens: Kitchen[] = (parsed as any).kitchens.map((k: any) => ({
      id: String(k.id),
      name: String(k.name || "Kitchen"),
      members: Array.isArray(k.members) ? k.members : [],
      freezer: Array.isArray(k.freezer) ? k.freezer : [],
      shopping: Array.isArray(k.shopping) ? k.shopping : [],
    }));

    return {
      currentKitchenId: (parsed as any).currentKitchenId ?? null,
      currentUserId: (parsed as any).currentUserId ?? null,
      kitchens,
    };
  } catch {
    return { currentKitchenId: null, currentUserId: null, kitchens: [] };
  }
}

function clampParLevelForPz(unit: Unit, v?: number) {
  if (unit !== "pz") return undefined; // MIN solo pz
  if (v === undefined || v === null) return undefined;
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

function reducer(state: KitchenState, action: Action): KitchenState {
  switch (action.type) {
    case "KITCHEN_CREATE": {
      const owner: Member = { id: uuid(), name: action.ownerName, role: action.ownerRole };
      const kitchen: Kitchen = { id: uuid(), name: action.name, members: [owner], freezer: [], shopping: [] };
      return {
        ...state,
        kitchens: [kitchen, ...state.kitchens],
        currentKitchenId: kitchen.id,
        currentUserId: owner.id,
      };
    }

    case "KITCHEN_SELECT":
      return { ...state, currentKitchenId: action.id };

    case "USER_SELECT":
      return { ...state, currentUserId: action.userId };

    case "ADD_MEMBER":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === action.kitchenId ? { ...k, members: [...k.members, action.member] } : k
        ),
        currentKitchenId: action.kitchenId,
        currentUserId: action.member.id,
      };

    case "UPDATE_MEMBER_ROLE":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === action.kitchenId
            ? { ...k, members: k.members.map((m) => (m.id === action.memberId ? { ...m, role: action.role } : m)) }
            : k
        ),
      };

    case "REMOVE_MEMBER":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === action.kitchenId ? { ...k, members: k.members.filter((m) => m.id !== action.memberId) } : k
        ),
        currentUserId: state.currentUserId === action.memberId ? null : state.currentUserId,
      };

    case "FREEZER_ADD":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === state.currentKitchenId ? { ...k, freezer: [action.item, ...(k.freezer || [])] } : k
        ),
      };

    case "FREEZER_REMOVE":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === state.currentKitchenId ? { ...k, freezer: (k.freezer || []).filter((it) => it.id !== action.id) } : k
        ),
      };

    case "FREEZER_ADJUST":
      return {
        ...state,
        kitchens: state.kitchens.map((k) => {
          if (k.id !== state.currentKitchenId) return k;

          const next = (k.freezer || [])
            .map((it) => {
              if (it.id !== action.id) return it;

              const unit = it.unit || "pz";
              let q = Number(it.quantity ?? 0) + Number(action.delta);

              if (unit === "pz") q = Math.floor(q);
              if (unit === "g" || unit === "ml") q = Math.round(q);

              return { ...it, quantity: q };
            })
            .filter((it) => Number(it.quantity ?? 0) > 0);

          return { ...k, freezer: next };
        }),
      };

    case "FREEZER_SET_PARLEVEL":
      return {
        ...state,
        kitchens: state.kitchens.map((k) => {
          if (k.id !== state.currentKitchenId) return k;

          const next = (k.freezer || []).map((it) => {
            if (it.id !== action.id) return it;
            const pl = clampParLevelForPz(it.unit, action.parLevel);
            return { ...it, parLevel: pl };
          });

          return { ...k, freezer: next };
        }),
      };

    case "SHOP_ADD":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === state.currentKitchenId ? { ...k, shopping: [action.item, ...(k.shopping || [])] } : k
        ),
      };

    case "SHOP_TOGGLE":
      return {
        ...state,
        kitchens: state.kitchens.map((k) => {
          if (k.id !== state.currentKitchenId) return k;
          const next = (k.shopping || []).map((it) => (it.id === action.id ? { ...it, checked: !it.checked } : it));
          return { ...k, shopping: next };
        }),
      };

    case "SHOP_REMOVE":
      return {
        ...state,
        kitchens: state.kitchens.map((k) => {
          if (k.id !== state.currentKitchenId) return k;
          return { ...k, shopping: (k.shopping || []).filter((it) => it.id !== action.id) };
        }),
      };

    case "SHOP_ADD_OR_UPDATE_LOW": {
        return {
          ...state,
          kitchens: state.kitchens.map(k => {
            if (k.id !== state.currentKitchenId) return k;
            const existing = k.shopping.find(s => s.name === action.name && s.category === "economato");
            if (existing) {
              return {
                ...k,
                shopping: k.shopping.map(s =>
                  s.name === action.name && s.category === "economato"
                    ? { ...s, quantity: action.quantity }
                    : s
                )
              };
            }
            return {
              ...k,
              shopping: [
                ...k.shopping,
                {
                  id: crypto.randomUUID(),
                  name: action.name,
                  quantity: action.quantity,
                  unit: action.unit,
                  category: "economato",
                  checked: false
                }
              ]
            };
          })
        };
      }

      case "SHOP_CLEAR_CHECKED":
      return {
        ...state,
        kitchens: state.kitchens.map((k) => {
          if (k.id !== state.currentKitchenId) return k;
          return {
            ...k,
            shopping: (k.shopping || []).filter((it) => !(it.category === action.category && it.checked)),
          };
        }),
      };

    default:
      return state;
  }
}

export type KitchenStore = {
  state: KitchenState;

  createKitchen: (name: string, ownerName?: string, ownerRole?: Role) => void;
  selectKitchen: (id: string) => void;

  addMember: (kitchenId: string, name: string, role: Role) => void;
  updateMemberRole: (kitchenId: string, memberId: string, role: Role) => void;
  removeMember: (kitchenId: string, memberId: string) => void;

  addFreezerItem: (item: FreezerItem) => void;
  adjustFreezerItem: (id: string, delta: number) => void;
  removeFreezerItem: (id: string) => void;
  setFreezerParLevel: (id: string, parLevel?: number) => void;

  shopAdd: (name: string, quantity: number, unit: Unit, category: ShoppingCategory, notes?: string) => void;
  shopToggle: (id: string) => void;
  shopRemove: (id: string) => void;
  shopClearChecked: (category: ShoppingCategory) => void;

  switchUser: (userId: string) => void;
  getCurrentRole: () => Role | null;
};

const KitchenContext = createContext<KitchenStore | null>(null);

export function KitchenProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined as any, loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  

  function autoGenerateLowStock() {
    if (!state.currentKitchenId) return;

    const kitchen = state.kitchens.find(k => k.id === state.currentKitchenId);
    if (!kitchen) return;

    kitchen.freezer.forEach(item => {
      if (item.unit !== "pz") return;
      const min = item.parLevel ?? 5;
      if (item.quantity >= min) return;

      const diff = min - item.quantity;

      dispatch({
        type: "SHOP_ADD_OR_UPDATE_LOW",
        name: item.name,
        quantity: diff,
        unit: "pz",
      });
    });
  }

  const store = useMemo<KitchenStore>(() => {
    return {
      state,

      createKitchen: (name: string, ownerName = "Owner", ownerRole: Role = "admin") =>
        dispatch({ type: "KITCHEN_CREATE", name, ownerName, ownerRole }),

      selectKitchen: (id: string) => dispatch({ type: "KITCHEN_SELECT", id }),

      addMember: (kitchenId: string, name: string, role: Role) =>
        dispatch({ type: "ADD_MEMBER", kitchenId, member: { id: uuid(), name, role } }),

      updateMemberRole: (kitchenId: string, memberId: string, role: Role) =>
        dispatch({ type: "UPDATE_MEMBER_ROLE", kitchenId, memberId, role }),

      removeMember: (kitchenId: string, memberId: string) =>
        dispatch({ type: "REMOVE_MEMBER", kitchenId, memberId }),

      addFreezerItem: (item: FreezerItem) => dispatch({ type: "FREEZER_ADD", item }),
      adjustFreezerItem: (id: string, delta: number) => dispatch({ type: "FREEZER_ADJUST", id, delta }),
      removeFreezerItem: (id: string) => dispatch({ type: "FREEZER_REMOVE", id }),
      setFreezerParLevel: (id: string, parLevel?: number) => dispatch({ type: "FREEZER_SET_PARLEVEL", id, parLevel }),

      shopAdd: (name: string, quantity: number, unit: Unit, category: ShoppingCategory, notes?: string) =>
        dispatch({
          type: "SHOP_ADD",
          item: {
            id: uuid(),
            name: name.trim(),
            quantity: unit === "pz" ? Math.floor(quantity) : quantity,
            unit,
            category,
            checked: false,
            createdAt: new Date().toISOString(),
            notes,
          },
        }),

      shopToggle: (id: string) => dispatch({ type: "SHOP_TOGGLE", id }),
      shopRemove: (id: string) => dispatch({ type: "SHOP_REMOVE", id }),
      shopClearChecked: (category: ShoppingCategory) => dispatch({ type: "SHOP_CLEAR_CHECKED", category }),

      switchUser: (userId: string) => dispatch({ type: "USER_SELECT", userId }),

      getCurrentRole: () => {
        if (!state.currentKitchenId || !state.currentUserId) return null;
        const k = state.kitchens.find((x) => x.id === state.currentKitchenId);
        const m = k?.members.find((mm) => mm.id === state.currentUserId);
        return m?.role ?? null;
      },
    };
  }, [state]);

  return <KitchenContext.Provider value={store}>{children}</KitchenContext.Provider>;
}

export function useKitchen() {
  const ctx = useContext(KitchenContext);
  if (!ctx) throw new Error("useKitchen must be used within KitchenProvider");
  return ctx;
}
