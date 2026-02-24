import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
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
  createdAt: string; // ISO
};

export type ShoppingCategory = "economato" | "giornaliero" | "settimanale";

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit; // per ora usiamo Unit di freezer
  category: ShoppingCategory;
  checked: boolean;
  notes?: string;
  createdAt: string; // ISO (OBBLIGATORIO)
  updatedAt?: string; // ISO
};

export type Kitchen = {
  id: string;
  name: string;
  members: Member[];
  freezer: FreezerItem[];
  shopping: ShoppingItem[];
  createdAt: string;
};

export type KitchenState = {
  currentKitchenId: string | null;
  currentUserId: string | null;
  kitchens: Kitchen[];
};

const NS = "kitchen-pro:v2";
const STORAGE_KEY = `${NS}:state`;

function nowISO() {
  return new Date().toISOString();
}

function safeLoad(): KitchenState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { currentKitchenId: null, currentUserId: null, kitchens: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error("bad state");
    return parsed as KitchenState;
  } catch {
    return { currentKitchenId: null, currentUserId: null, kitchens: [] };
  }
}

function safeSave(state: KitchenState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

type Action =
  | { type: "KITCHEN_CREATE"; name: string; ownerName: string; ownerRole: Role }
  | { type: "KITCHEN_SELECT"; id: string }
  | { type: "USER_SELECT"; userId: string }

  | { type: "ADD_MEMBER"; kitchenId: string; name: string; role: Role }
  | { type: "UPDATE_MEMBER_ROLE"; kitchenId: string; memberId: string; role: Role }
  | { type: "REMOVE_MEMBER"; kitchenId: string; memberId: string }

  | { type: "FREEZER_ADD"; item: FreezerItem }
  | { type: "FREEZER_REMOVE"; id: string }
  | { type: "FREEZER_ADJUST"; id: string; delta: number }
  | { type: "FREEZER_SET_PARLEVEL"; id: string; parLevel: number }

  | { type: "SHOP_ADD"; item: ShoppingItem }
  | { type: "SHOP_TOGGLE"; id: string }
  | { type: "SHOP_REMOVE"; id: string }
  | { type: "SHOP_CLEAR_CHECKED"; category: ShoppingCategory }
  | {
      type: "SHOP_UPSERT_ECONOMATO";
      name: string;
      quantity: number;
      unit: Unit;
      notes?: string;
    };

function reducer(state: KitchenState, action: Action): KitchenState {
  switch (action.type) {
    case "KITCHEN_CREATE": {
      const kitchenId = uuid();
      const ownerId = uuid();
      const createdAt = nowISO();

      const kitchen: Kitchen = {
        id: kitchenId,
        name: action.name.trim(),
        createdAt,
        members: [
          {
            id: ownerId,
            name: action.ownerName.trim() || "Admin",
            role: action.ownerRole,
            createdAt,
          },
        ],
        freezer: [],
        shopping: [],
      };

      return {
        ...state,
        kitchens: [kitchen, ...state.kitchens],
        currentKitchenId: kitchenId,
        currentUserId: ownerId,
      };
    }

    case "KITCHEN_SELECT":
      return { ...state, currentKitchenId: action.id };

    case "USER_SELECT":
      return { ...state, currentUserId: action.userId };

    case "ADD_MEMBER": {
      const createdAt = nowISO();
      const member: Member = {
        id: uuid(),
        name: action.name.trim(),
        role: action.role,
        createdAt,
      };

      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === action.kitchenId
            ? { ...k, members: [...k.members, member] }
            : k
        ),
      };
    }

    case "UPDATE_MEMBER_ROLE":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === action.kitchenId
            ? {
                ...k,
                members: k.members.map((m) =>
                  m.id === action.memberId ? { ...m, role: action.role } : m
                ),
              }
            : k
        ),
      };

    case "REMOVE_MEMBER":
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === action.kitchenId
            ? { ...k, members: k.members.filter((m) => m.id !== action.memberId) }
            : k
        ),
      };

    case "FREEZER_ADD": {
      const kid = state.currentKitchenId;
      if (!kid) return state;
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === kid ? { ...k, freezer: [action.item, ...k.freezer] } : k
        ),
      };
    }

    case "FREEZER_REMOVE": {
      const kid = state.currentKitchenId;
      if (!kid) return state;
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === kid ? { ...k, freezer: k.freezer.filter((x) => x.id !== action.id) } : k
        ),
      };
    }

    case "FREEZER_ADJUST": {
      const kid = state.currentKitchenId;
      if (!kid) return state;

      return {
        ...state,
        kitchens: state.kitchens.map((k) => {
          if (k.id !== kid) return k;

          const next = k.freezer
            .map((it) => {
              if (it.id !== action.id) return it;
              const q = Math.max(0, Number(it.quantity ?? 0) + action.delta);
              return { ...it, quantity: q };
            })
            .filter((it) => Number(it.quantity ?? 0) > 0);

          return { ...k, freezer: next };
        }),
      };
    }

    case "FREEZER_SET_PARLEVEL": {
      const kid = state.currentKitchenId;
      if (!kid) return state;

      return {
        ...state,
        kitchens: state.kitchens.map((k) => {
          if (k.id !== kid) return k;
          return {
            ...k,
            freezer: k.freezer.map((it: any) =>
              it.id === action.id ? { ...it, parLevel: Math.max(0, Math.floor(action.parLevel)) } : it
            ),
          };
        }),
      };
    }

    case "SHOP_ADD": {
      const kid = state.currentKitchenId;
      if (!kid) return state;
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === kid ? { ...k, shopping: [action.item, ...k.shopping] } : k
        ),
      };
    }

    case "SHOP_TOGGLE": {
      const kid = state.currentKitchenId;
      if (!kid) return state;
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === kid
            ? {
                ...k,
                shopping: k.shopping.map((s) =>
                  s.id === action.id ? { ...s, checked: !s.checked, updatedAt: nowISO() } : s
                ),
              }
            : k
        ),
      };
    }

    case "SHOP_REMOVE": {
      const kid = state.currentKitchenId;
      if (!kid) return state;
      return {
        ...state,
        kitchens: state.kitchens.map((k) =>
          k.id === kid ? { ...k, shopping: k.shopping.filter((s) => s.id !== action.id) } : k
        ),
      };
    }

    case "SHOP_CLEAR_CHECKED": {
      const kid = state.currentKitchenId;
      if (!kid) return state;
      return {
        ...state,
        kitchens: state.kitchens.map((k) => {
          if (k.id !== kid) return k;
          return {
            ...k,
            shopping: k.shopping.filter(
              (s) => !(s.category === action.category and s.checked)
            ),
          };
        }),
      };
    }

    case "SHOP_UPSERT_ECONOMATO": {
      const kid = state.currentKitchenId;
      if (!kid) return state;

      const nameKey = action.name.trim().toLowerCase();
      const delta = Math.max(1, Math.floor(action.quantity));

      return {
        ...state,
        kitchens: state.kitchens.map((k) => {
          if (k.id !== kid) return k;

          const idx = k.shopping.findIndex(
            (s) => s.category === "economato" && s.name.trim().toLowerCase() === nameKey
          );

          if (idx === -1) {
            const item: ShoppingItem = {
              id: uuid(),
              name: action.name.trim(),
              quantity: delta,
              unit: action.unit,
              category: "economato",
              checked: false,
              notes: action.notes,
              createdAt: nowISO(),
            };
            return { ...k, shopping: [item, ...k.shopping] };
          }

          const existing = k.shopping[idx];
          const updated: ShoppingItem = {
            ...existing,
            quantity: Math.max(1, Math.floor(Number(existing.quantity ?? 0) + delta)),
            unit: action.unit,
            notes: existing.notes || action.notes,
            updatedAt: nowISO(),
          };

          const next = k.shopping.slice();
          next[idx] = updated;
          return { ...k, shopping: next };
        }),
      };
    }

    default:
      return state;
  }
}

type KitchenStore = {
  state: KitchenState;

  createKitchen: (name: string, ownerName?: string, ownerRole?: Role) => void;
  selectKitchen: (id: string) => void;
  selectUser: (userId: string) => void;

  addMember: (kitchenId: string, name: string, role: Role) => void;
  updateMemberRole: (kitchenId: string, memberId: string, role: Role) => void;
  removeMember: (kitchenId: string, memberId: string) => void;

  addFreezerItem: (item: FreezerItem) => void;
  removeFreezerItem: (id: string) => void;
  adjustFreezerItem: (id: string, delta: number) => void;
  setFreezerParLevel: (id: string, parLevel: number) => void;

  shopAdd: (category: ShoppingCategory, name: string, quantity: number, unit: Unit, notes?: string) => void;
  shopToggle: (id: string) => void;
  shopRemove: (id: string) => void;
  shopClearChecked: (category: ShoppingCategory) => void;

  autoGenerateLowStockToEconomato: () => number;

  getCurrentRole: () => Role | null;
};

const Ctx = createContext<KitchenStore | null>(null);

export function KitchenProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, safeLoad);

  useEffect(() => {
    safeSave(state);
  }, [state]);

  const store = useMemo<KitchenStore>(() => {
    function createKitchen(name: string, ownerName = "Admin", ownerRole: Role = "admin") {
      dispatch({ type: "KITCHEN_CREATE", name, ownerName, ownerRole });
    }

    function selectKitchen(id: string) {
      dispatch({ type: "KITCHEN_SELECT", id });
    }

    function selectUser(userId: string) {
      dispatch({ type: "USER_SELECT", userId });
    }

    function addMember(kitchenId: string, name: string, role: Role) {
      dispatch({ type: "ADD_MEMBER", kitchenId, name, role });
    }

    function updateMemberRole(kitchenId: string, memberId: string, role: Role) {
      dispatch({ type: "UPDATE_MEMBER_ROLE", kitchenId, memberId, role });
    }

    function removeMember(kitchenId: string, memberId: string) {
      dispatch({ type: "REMOVE_MEMBER", kitchenId, memberId });
    }

    function addFreezerItem(item: FreezerItem) {
      dispatch({ type: "FREEZER_ADD", item });
    }

    function removeFreezerItem(id: string) {
      dispatch({ type: "FREEZER_REMOVE", id });
    }

    function adjustFreezerItem(id: string, delta: number) {
      dispatch({ type: "FREEZER_ADJUST", id, delta });
    }

    function setFreezerParLevel(id: string, parLevel: number) {
      dispatch({ type: "FREEZER_SET_PARLEVEL", id, parLevel });
    }

    function shopAdd(category: ShoppingCategory, name: string, quantity: number, unit: Unit, notes?: string) {
      const item: ShoppingItem = {
        id: uuid(),
        name: name.trim(),
        quantity: Math.max(1, Math.floor(Number(quantity))),
        unit,
        category,
        checked: false,
        createdAt: nowISO(),
        notes,
      } as any;
      item.checked = false;
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

    function autoGenerateLowStockToEconomato(): number {
      const kid = state.currentKitchenId;
      if (!kid) return 0;
      const kitchen = state.kitchens.find((k) => k.id === kid);
      if (!kitchen) return 0;

      let count = 0;
      for (const it of kitchen.freezer as any[]) {
        const unit = (it.unit || "pz") as Unit;
        if (unit !== "pz") continue;

        const min = it.parLevel ?? 5;
        const qty = Number(it.quantity ?? 0);
        if (qty >= min) continue;

        dispatch({
          type: "SHOP_UPSERT_ECONOMATO",
          name: it.name,
          quantity: Math.max(1, min - qty),
          unit: "pz",
          notes: "AUTO: reintegro da LOW stock",
        });

        count += 1;
      }
      return count;
    }

    function getCurrentRole(): Role | null {
      const kid = state.currentKitchenId;
      const uid = state.currentUserId;
      if (!kid || !uid) return null;
      return null;
    }

    // clean placeholders above without risking TS parser:
    const getRoleSafe = () => {
      const kid = state.currentKitchenId;
      const uid = state.currentUserId;
      if (!kid || !uid) return null;
      const kitchen = state.kitchens.find((k) => k.id === kid);
      if (!kitchen) return null;
      const m = kitchen.members.find((x) => x.id === uid);
      return (m?.role ?? null) as Role | null;
    };

    return {
      state,
      createKitchen,
      selectKitchen,
      selectUser,
      addMember,
      updateMemberRole,
      removeMember,
      addFreezerItem,
      removeFreezerItem,
      adjustFreezerItem,
      setFreezerParLevel,
      shopAdd,
      shopToggle,
      shopRemove,
      shopClearChecked,
      autoGenerateLowStockToEconomato,
      getCurrentRole: getRoleSafe,
    };
  }, [state]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useKitchen() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useKitchen must be used within KitchenProvider");
  return ctx;
}
