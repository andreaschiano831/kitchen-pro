import { useState } from "react";
import type { FreezerItem } from "../types/freezer";

export function useKitchenStore() {
  const [freezer, setFreezer] = useState<FreezerItem[]>([]);

  function addFreezerItem(item: FreezerItem) {
    setFreezer((prev) => [...prev, item]);
  }

  return {
    freezer,
    addFreezerItem,
  };
}

