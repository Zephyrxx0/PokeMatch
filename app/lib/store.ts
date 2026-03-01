import { create } from "zustand";
import type { Pokemon } from "@/app/types/pokemon";

interface TeamStore {
  team: Pokemon[];
  playstyle: string;
  backendOnline: boolean;
  addPokemon: (pokemon: Pokemon) => void;
  removePokemon: (index: number) => void;
  setTeam: (team: Pokemon[]) => void;
  setPlaystyle: (playstyle: string) => void;
  setBackendOnline: (online: boolean) => void;
  clearTeam: () => void;
}

export const useTeamStore = create<TeamStore>((set) => ({
  team: [],
  playstyle: "balanced",
  backendOnline: false,
  addPokemon: (pokemon) =>
    set((state) => {
      if (state.team.length >= 6) return state;
      if (state.team.some((p) => p.id === pokemon.id)) return state;
      return { team: [...state.team, pokemon] };
    }),
  removePokemon: (index) =>
    set((state) => ({
      team: state.team.filter((_, i) => i !== index),
    })),
  setTeam: (team) => set({ team }),
  setPlaystyle: (playstyle) => set({ playstyle }),
  setBackendOnline: (online) => set({ backendOnline: online }),
  clearTeam: () => set({ team: [] }),
}));
