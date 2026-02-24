import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { v4 as uuid } from "uuid";
import type { FreezerItem } from "../types/freezer";

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

type FreezerItemExt = FreezerItem & {
  id: string;
  name: string;
  quantity: number;
  unit: any; // unit union vive in ../types/freezer; qui restiamo tolleranti
  location?: "freezer" | "fridge";
  insertedAt: string;
  expiresAt?: string;
  section?: string;
  notes?: string;
};

export type Kitchen = {
  id: string;
  name: string;
  members: Member[];
  freezer: FreezerItemExt[];
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
  | { type: "FREEZER_ADD"; item: FreezerItemExt }
  | { type: "FREEZER_REMOVE"; id: string }
  | { type: "FREEZER_ADJUST"; id: string; delta: number };

const STORAGE_KEY = "kitchen-pro:v1";

function loadInitial(): KitchenState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { currentKitchenId: null, currentUserId: null, kitchens: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { currentKitchenId: null, currentUserId: null, kitchens: [] };
    if (!Array.isArray(parsed.kitchens)) return { currentKitchenId: null, currentUserId: null, kitchens: [] };
    return {
      currentKitchenId: parsed.currentKitchenId ?? null,
      currentUserId: parsed.currentUserId ?? null,
      kitchens: parsed.kitchens,
    };
  } catch {
    return { currentKitchenId: null, currentUserId: null, kitchens: [] };
  }
}

function reducer(state: KitchenState, action: Action): KitchenState {
  switch (action.type) {
    case "KITCHEN_CREATE": {
      const owner: Member = { id: uuid(), name: action.ownerName, role: action.ownerRole };
      const kitchen: Kitchen = { id: uuid(), name: action.name, members: [owner], freezer: [] };
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
            ? {
                ...k,
                members: k.members.map((m) => (m.id === action.memberId ? { ...m, role: action.role } : m)),
              }
            : k
        ),
      };

    case "REMOVE_MEMBER":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === action.kitchenId ? { ...k, members: k.members.filter((m) => m.id !== action.memberId) } : k
        ),
        currentUserId:
          state.currentUserId === action.memberId ? null : state.currentUserId,
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

              const unit = String((it as any).unit || "pz");
              let q = Number((it as any).quantity ?? 0) + Number(action.delta);

              if (unit === "pz") q = Math.floor(q);
              if (unit === "g" || unit === "ml") q = Math.round(q);

              return { ...it, quantity: q };
            })
            .filter((it) => Number((it as any).quantity ?? 0) > 0);

          return { ...k, freezer: next };
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

  addFreezerItem: (item: FreezerItemExt) => void;
  adjustFreezerItem: (id: string, delta: number) => void;
  removeFreezerItem: (id: string) => void;

  switchUser: (userId: string) => void;
  getCurrentRole: () => Role | null;
};

const KitchenContext = createContext<KitchenStore | null>(null);

export function KitchenProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined as any, loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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

      addFreezerItem: (item: FreezerItemExt) => dispatch({ type: "FREEZER_ADD", item }),
      adjustFreezerItem: (id: string, delta: number) => dispatch({ type: "FREEZER_ADJUST", id, delta }),
      removeFreezerItem: (id: string) => dispatch({ type: "FREEZER_REMOVE", id }),

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
