import type { AsciiThingDef } from "./types";

export type FurnitureJson = {
  symbol: string;
  width: number;
  height: number;
  texture: string;
  solid?: boolean;
  areaOfInteraction?: number;
  priority?: number;
  interaction?: string;
};

const modules = import.meta.glob("./*.json", {
  eager: true,
  import: "default",
}) as Record<string, FurnitureJson>;

const RAW_DEFS: FurnitureJson[] = Object.values(modules);

export function buildThingDefs(
  resolveInteraction: (interaction?: string) => (() => void) | undefined,
): Record<string, AsciiThingDef> {
  const defs: Record<string, AsciiThingDef> = {};

  RAW_DEFS.forEach((def) => {
    defs[def.symbol] = {
      width: def.width,
      height: def.height,
      texture: def.texture,
      solid: def.solid ?? true,
      areaOfInteraction: def.areaOfInteraction ?? -1,
      priority: def.priority ?? 0,
      onInteract: resolveInteraction(def.interaction),
    };
  });

  return defs;
}
