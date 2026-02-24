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

export type Member = { id: string; name: string; role: Role };

export type ShoppingCategory = "economato" | "giornaliero" | "settimanale";

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  category: ShoppingCategory;
  checked: boolean;
  notes?: string;
  createdAt: string; // ISO
};

export type Kitchen = {
  id: string;
  name: string;
  members: Member[];
  freezer: FreezerItem[];     // include freezer+fridge via item.location
  shopping: ShoppingItem[];
  parByCategory: Record<string, number>;
};

export type KitchenState = {
  currentKitchenId: string | null;
  currentUserId: string | null;
  kitchens: Kitchen[];
};

type Action =
  | { type: "KITCHEN_CREATE"; kitchen: Kitchen; userId: string }
  | { type: "KITCHEN_SELECT"; id: string }
  | { type: "SET_CURRENT_USER"; userId: string | null }
  | { type: "ADD_MEMBER"; kitchenId: string; member: Member }
  | { type: "UPDATE_MEMBER_ROLE"; kitchenId: string; memberId: string; role: Role }
  | { type: "REMOVE_MEMBER"; kitchenId: string; memberId: string }
  | { type: "FREEZER_ADD"; item: FreezerItem }
  | { type: "FREEZER_REMOVE"; id: string }
  | { type: "FREEZER_ADJUST"; id: string; delta: number }
  | { type: "FREEZER_SET_PAR"; id: string; parLevel: number | null }
  | { type: "SHOP_ADD"; item: ShoppingItem }
  | { type: "SHOP_TOGGLE"; id: string }
  | { type: "SHOP_REMOVE"; id: string }
  | { type: "SHOP_CLEAR_CHECKED"; category: ShoppingCategory }
  | { type: "PAR_CATEGORY_SET"; category: string; value: number}
  | { type: "SHOP_UPSERT_ECONOMATO"; name: string; quantity: number; unit: Unit; notes?: string };

const NS = "kitchen-pro:v1";

function loadState(): KitchenState {
  try {
    const raw = localStorage.getItem(NS);
    if (!raw) return { currentKitchenId: null, currentUserId: null, kitchens: [] };
    const s = JSON.parse(raw);
    if (!s || typeof s !== "object") return { currentKitchenId: null, currentUserId: null, kitchens: [] };
    return {
      currentKitchenId: s.currentKitchenId ?? null,
      currentUserId: s.currentUserId ?? null,
      kitchens: Array.isArray(s.kitchens) ? s.kitchens : [],
    };
  } catch {
    return { currentKitchenId: null, currentUserId: null, kitchens: [] };
  }
}

function saveState(state: KitchenState) {
  localStorage.setItem(NS, JSON.stringify(state));
}

function reducer(state: KitchenState, action: Action): KitchenState {
  switch (action.type) {
    case "KITCHEN_CREATE":
      return {
        ...state,
        kitchens: [...state.kitchens, action.kitchen],
        currentKitchenId: action.kitchen.id,
        currentUserId: action.userId,
      };

    case "KITCHEN_SELECT":
      return { ...state, currentKitchenId: action.id };

    case "SET_CURRENT_USER":
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
          k.id !== action.kitchenId
            ? k
            : {
                ...k,
                members: k.members.map((m) => (m.id === action.memberId ? { ...m, role: action.role } : m)),
              }
        ),
      };

    case "REMOVE_MEMBER":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id !== action.kitchenId ? k : { ...k, members: k.members.filter((m) => m.id !== action.memberId) }
        ),
        currentUserId: state.currentUserId === action.memberId ? null : state.currentUserId,
      };

    case "FREEZER_ADD":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === state.currentKitchenId ? { ...k, freezer: [...(k.freezer || []), action.item] } : k
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
            .map((it) => (it.id === action.id ? { ...it, quantity: Math.max(0, Number(it.quantity || 0) + action.delta) } : it))
            .filter((it) => Number(it.quantity || 0) > 0); // auto-remove at zero
          return { ...k, freezer: next };
        }),
      };

    case "FREEZER_SET_PAR":
      return {
        ...state,
        kitchens: state.kitchens.map((k) => {
          if (k.id !== state.currentKitchenId) return k;
          return {
            ...k,
            freezer: (k.freezer || []).map((it) => (it.id === action.id ? { ...it, parLevel: action.parLevel } : it)),
          };
        }),
      };

    case "SHOP_ADD":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === state.currentKitchenId ? { ...k, shopping: [...(k.shopping || []), action.item] } : k
        ),
      };

    case "SHOP_TOGGLE":
      return {
        ...state,
        kitchens: state.kitchens.map((k) => {
          if (k.id !== state.currentKitchenId) return k;
          return { ...k, shopping: (k.shopping || []).map((s) => (s.id === action.id ? { ...s, checked: !s.checked } : s)) };
        }),
      };

    case "SHOP_REMOVE":
      return {
        ...state,
        kitchens: state.kitchens.map((k) => {
          if (k.id !== state.currentKitchenId) return k;
          return { ...k, shopping: (k.shopping || []).filter((s) => s.id !== action.id) };
        }),
      };

    case "PAR_CATEGORY_SET": {
      const kitchenId = state.currentKitchenId;
      if (!kitchenId) return state;
      const cat = action.category.trim() || "default";
      const val = Math.max(1, Math.floor(action.value || 5));
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === kitchenId ? { ...k, parByCategory: { ...(k.parByCategory || { default: 5 }), [cat]: val } } : k
        ),
      };
    }

    case "SHOP_CLEAR_CHECKED":
      return {
        ...state,
        kitchens: state.kitchens.map((k) => {
          if (k.id !== state.currentKitchenId) return k;
          return {
            ...k,
            shopping: (k.shopping || []).filter((s) => !(s.category === action.category && s.checked)),
          };
        }),
      };

    case "SHOP_UPSERT_ECONOMATO":
      return {
        ...state,
        kitchens: state.kitchens.map((k) => {
          if (k.id !== state.currentKitchenId) return k;
          const list = k.shopping || [];
          const key = action.name.trim().toLowerCase();
          const idx = list.findIndex((x) => x.category === "economato" && x.name.trim().toLowerCase() === key);
          if (idx === -1) {
            const item: ShoppingItem = {
              id: uuid(),
              name: action.name,
              quantity: Math.max(1, Math.trunc(action.quantity)),
              unit: action.unit,
              category: "economato",
              checked: false,
              notes: action.notes,
              createdAt: new Date().toISOString(),
            };
            return { ...k, shopping: [...list, item] };
          }
          const cur = list[idx];
          const upd: ShoppingItem = {
            ...cur,
            quantity: Math.max(1, Math.trunc(Number(cur.quantity || 0) + Number(action.quantity || 0))),
            unit: action.unit,
            notes: action.notes || cur.notes,
            checked: false,
          };
          const next = list.slice();
          next[idx] = upd;
          return { ...k, shopping: next };
        }),
      };

    default:
      return state;
  }
}

export type KitchenStore = {
  state: KitchenState;

  createKitchen: (name: string, ownerName: string) => void;
  selectKitchen: (id: string) => void;

  addMember: (kitchenId: string, name: string, role: Role) => void;
  updateMemberRole: (kitchenId: string, memberId: string, role: Role) => void;
  removeMember: (kitchenId: string, memberId: string) => void;
  setCurrentUser: (userId: string | null) => void;

  addFreezerItem: (item: FreezerItem) => void;
  removeFreezerItem: (id: string) => void;
  adjustFreezerItem: (id: string, delta: number) => void;
  setFreezerParLevel: (id: string, parLevel: number | null) => void;

  shopAdd: (name: string, quantity: number, unit: Unit, category: ShoppingCategory, notes?: string) => void;
  shopToggle: (id: string) => void;
  shopRemove: (id: string) => void;
  shopClearChecked: (category: ShoppingCategory) => void;

  autoGenerateLowStockToEconomato: () => number;

  getCurrentRole: () => Role | null;
};

const Ctx = createContext<KitchenStore | null>(null);

export function KitchenProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const store = useMemo<KitchenStore>(() => {
    function createKitchen(name: string, ownerName: string) {
      const kitchenId = uuid();
      const ownerId = uuid();
      const kitchen: Kitchen = {
        id: kitchenId,
        name: name.trim(),
        members: [{ id: ownerId, name: ownerName.trim() || "Owner", role: "admin" }],
        freezer: [],
        shopping: [],
        parByCategory: { default: 5 },
      };
      dispatch({ type: "KITCHEN_CREATE", kitchen, userId: ownerId });
    }

    function selectKitchen(id: string) {
      dispatch({ type: "KITCHEN_SELECT", id });
    }

    function setCurrentUser(userId: string | null) {
      dispatch({ type: "SET_CURRENT_USER", userId });
    }

    function addMember(kitchenId: string, name: string, role: Role) {
      const member: Member = { id: uuid(), name: name.trim(), role };
      dispatch({ type: "ADD_MEMBER", kitchenId, member });
    }

    function updateMemberRole(kitchenId: string, memberId: string, role: Role) {
      dispatch({ type: "UPDATE_MEMBER_ROLE", kitchenId, memberId, role });
    }

    function removeMember(kitchenId: string, memberId: string) {
      dispatch({ type: "REMOVE_MEMBER", kitchenId, memberId });
    }

    function addFreezerItem(item: FreezerItem) {
    const kitchen = state.kitchens.find((k) => k.id === state.currentKitchenId);
    const cat = (item as any).category?.trim() || "default";
    const parMap = (kitchen as any)?.parByCategory || { default: 5 };
    const autoPar = item.unit === "pz" ? (item.parLevel ?? parMap[cat] ?? parMap.default ?? 5) : undefined;
    dispatch({ type: "FREEZER_ADD", item: { ...item, parLevel: autoPar } as any });
  }

    function removeFreezerItem(id: string) {
      dispatch({ type: "FREEZER_REMOVE", id });
    }

    function adjustFreezerItem(id: string, delta: number) {
      dispatch({ type: "FREEZER_ADJUST", id, delta });
    }

    function setFreezerParLevel(id: string, parLevel: number | null) {
      dispatch({ type: "FREEZER_SET_PAR", id, parLevel });
    }

    function shopAdd(name: string, quantity: number, unit: Unit, category: ShoppingCategory, notes?: string) {
      const item: ShoppingItem = {
        id: uuid(),
        name: name.trim(),
        quantity: Math.max(1, Math.trunc(quantity)),
        unit,
        category,
        checked: false,
        notes,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "SHOP_ADD", item });
    }

    function shopToggle(id: string) {
      dispatch({ type: "SHOP_TOGGLE", id });
    }

    function shopRemove(id: string) {
      dispatch({ type: "SHOP_REMOVE", id });
    }

    function shopClearChecked(category: ShoppingCategory) {
      dispatch({ type: "SHOP_CLEAR_CHECKED", category });
    }

    function autoGenerateLowStockToEconomato() {
      const kitchen = state.kitchens.find((k) => k.id === state.currentKitchenId);
      if (!kitchen) return 0;

      let count = 0;
      for (const it of kitchen.freezer || []) {
        if ((it.unit || "pz") !== "pz") continue;
        const min = (it as any).parLevel ?? 5;
        const qty = Number(it.quantity ?? 0);
        if (qty >= min) continue;
        const diff = Math.max(1, min - qty);

        dispatch({
          type: "SHOP_UPSERT_ECONOMATO",
          name: it.name,
          quantity: diff,
          unit: "pz",
          notes: "AUTO: reintegro da LOW stock",
        });

        count += 1;
      }
      return count;
    }

    function getCurrentRole(): Role | null {
      const kitchen = state.kitchens.find((k) => k.id === state.currentKitchenId);
      if (!kitchen) return null;
      const me = kitchen.members.find((m) => m.id === state.currentUserId);
      return me?.role ?? null;
    }

    return {
      state,
      createKitchen,
      selectKitchen,
      addMember,
      updateMemberRole,
      removeMember,
      setCurrentUser,
      addFreezerItem,
      removeFreezerItem,
      adjustFreezerItem,
      setFreezerParLevel,
      shopAdd,
      shopToggle,
      shopRemove,
      shopClearChecked,
      autoGenerateLowStockToEconomato,
      getCurrentRole,
    };
  }, [state]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useKitchen() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useKitchen must be used within KitchenProvider");
  return ctx;
}
