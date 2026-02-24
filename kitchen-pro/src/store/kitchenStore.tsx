import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
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

export type Kitchen = {
  id: string;
  name: string;
  freezer: FreezerItem[];
  members: Member[];
};

export type KitchenState = {
  currentKitchenId: string | null;
  currentUserId: string | null;
  kitchens: Kitchen[];
};

type Action =
  | { type: "KITCHEN_CREATE"; kitchen: Kitchen }
  | { type: "KITCHEN_SELECT"; id: string }
  | { type: "SET_USER"; id: string }
  | { type: "ADD_MEMBER"; kitchenId: string; member: Member }
  | { type: "UPDATE_MEMBER_ROLE"; kitchenId: string; memberId: string; role: Role }
  | { type: "REMOVE_MEMBER"; kitchenId: string; memberId: string }
  | { type: "FREEZER_ADD"; item: FreezerItem }
  
  | { type: "FREEZER_ADJUST"; id: string; delta: number }
| { type: "FREEZER_REMOVE"; id: string };

const STORAGE_KEY = "kitchen-pro:v4";

const initialState: KitchenState = {
  currentKitchenId: null,
  currentUserId: null,
  kitchens: [],
};

function reducer(state: KitchenState, action: Action): KitchenState {
  switch (action.type) {
    case "KITCHEN_CREATE":
      return {
        ...state,
        kitchens: [...state.kitchens, action.kitchen],
        currentKitchenId: action.kitchen.id,
        currentUserId: action.kitchen.members[0]?.id ?? null,
      };

    case "KITCHEN_SELECT":
      return { ...state, currentKitchenId: action.id };

    case "SET_USER":
      return { ...state, currentUserId: action.id };

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

    case "REMOVE_MEMBER": {
      const kitchens = state.kitchens.map((k) =>
        k.id === action.kitchenId ? { ...k, members: k.members.filter((m) => m.id !== action.memberId) } : k
      );

      // Se rimuovi l'utente corrente, fallback al primo membro rimasto
      let currentUserId = state.currentUserId;
      let currentKitchenId = state.currentKitchenId;

      const affected = kitchens.find((k) => k.id === action.kitchenId);
      if (affected && state.currentUserId === action.memberId) {
        currentUserId = affected.members[0]?.id ?? null;
        currentKitchenId = affected.members.length ? action.kitchenId : null;
      }

      return { ...state, kitchens, currentUserId, currentKitchenId };
    }

    case "FREEZER_ADD":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === state.currentKitchenId ? { ...k, freezer: [action.item, ...k.freezer] } : k
        ),
      };

    case "FREEZER_ADJUST": {
      const id = action.id;
      const delta = action.delta;

      return {
        ...state,
        kitchens: state.kitchens.map((k) => {
          if (k.id !== state.currentKitchenId) return k;

          const next = (k.freezer || [])
            .map((it: any) => {
              if (it.id !== id) return it;

              const unit = it.unit as string;
              let q = Number(it.quantity) + Number(delta);

              if (unit === "pz") q = Math.floor(q); // pz sempre intero
              // g/ml preferibilmente interi
              if (unit === "g" || unit === "ml") q = Math.round(q);

              return { ...it, quantity: q };
            })
            .filter((it: any) => Number(it.quantity) > 0);

          return { ...k, freezer: next };
        }),
      };
    }
case "FREEZER_REMOVE":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === state.currentKitchenId ? { ...k, freezer: k.freezer.filter((x) => x.id !== action.id) } : k
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
    // fixup legacy items: default location
    for (const k of parsed.kitchens || []) {
      for (const it of (k.freezer || []) as any[]) {
        if (!it.location) it.location = "freezer";
      }
    }
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

export type KitchenStore = {
  state: KitchenState;
  createKitchen: (name: string, ownerName: string) => void;
  selectKitchen: (id: string) => void;

  addMember: (kitchenId: string, name: string, role: Role) => void;
  updateMemberRole: (kitchenId: string, memberId: string, role: Role) => void;
  removeMember: (kitchenId: string, memberId: string) => void;

  addFreezerItem: (item: FreezerItem) => void;
  adjustFreezerItem: (id: string, delta: number) => dispatch({ type: "FREEZER_ADJUST", id, delta }),

    removeFreezerItem: (id: string) => void;

  getCurrentRole: () => Role | null;
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

      createKitchen: (name, ownerName) => {
        const kitchenId = crypto.randomUUID();
        const ownerId = crypto.randomUUID();
        dispatch({
          type: "KITCHEN_CREATE",
          kitchen: {
            id: kitchenId,
            name,
            freezer: [],
            members: [{ id: ownerId, name: ownerName, role: "admin" }],
          },
        });
      },

      selectKitchen: (id) => dispatch({ type: "KITCHEN_SELECT", id }),

      addMember: (kitchenId, name, role) => {
        const memberId = crypto.randomUUID();
        dispatch({ type: "ADD_MEMBER", kitchenId, member: { id: memberId, name, role } });
      },

      updateMemberRole: (kitchenId, memberId, role) => {
        dispatch({ type: "UPDATE_MEMBER_ROLE", kitchenId, memberId, role });
      },

      removeMember: (kitchenId, memberId) => {
        dispatch({ type: "REMOVE_MEMBER", kitchenId, memberId });
      },

      addFreezerItem: (item) => dispatch({ type: "FREEZER_ADD", item }),
      removeFreezerItem: (id) => dispatch({ type: "FREEZER_REMOVE", id }),

      getCurrentRole: () => {
        const kitchen = state.kitchens.find((k) => k.id === state.currentKitchenId);
        if (!kitchen) return null;
        const member = kitchen.members.find((m) => m.id === state.currentUserId);
        return member?.role ?? null;
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
