export type AsciiThingDef = {
  width: number;
  height: number;
  texture?: string;
  solid?: boolean;
  areaOfInteraction?: number;
  priority?: number;
  onInteract?: () => void;
};
