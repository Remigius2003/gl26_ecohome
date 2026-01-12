import {
  Dynamic,
  DynamicTag,
  Entity,
  Interactable,
  InteractableTag,
  Solid,
  SolidTag,
} from "../core/types";

export type PartialDynamic = Partial<Dynamic>;
export type PartialInteractable = Pick<Interactable, "onInteract">;
export type PartialEntity = Partial<Entity> & Pick<Entity, "id" | "text">;
export type PartialCharacter = PartialEntity & PartialDynamic & Partial<Solid>;

export function createEntity(init: PartialEntity): Entity {
  return {
    id: init.id,
    x: init.x ?? 0,
    y: init.y ?? 0,
    width: init.width ?? 32,
    height: init.height ?? 32,
    priority: init.priority ?? 0,
    text: init.text,
  };
}

export function withDynamic<T extends Entity>(
  entity: T,
  init: PartialDynamic = {}
): T & Dynamic {
  return {
    ...entity,
    vx: init.vx ?? 0,
    vy: init.vy ?? 0,
    speed: init.speed ?? 100,
    [DynamicTag]: true,
  };
}

export function withSolid<T extends Entity>(entity: T): T & Solid {
  return {
    ...entity,
    [SolidTag]: true,
  };
}

export function withInteractable<T extends Entity>(
  entity: T,
  init: PartialInteractable
): T & Interactable {
  return {
    ...entity,
    onInteract: init.onInteract,
    [InteractableTag]: true,
  };
}

export function createCharacter(
  init: PartialCharacter
): Entity & Dynamic & Solid {
  let entity = withDynamic(
    withSolid(
      createEntity({
        ...init,
        priority: 2,
      })
    ),
    init
  );

  return entity;
}

export function createSolid(
  init: PartialEntity & PartialDynamic
): Entity & Solid {
  let entity = withSolid(
    createEntity({
      ...init,
      priority: 1,
    })
  );

  return entity;
}

// Deep background (parallax, skybox, far scenery)
export function createDeepBackground(init: PartialEntity): Entity {
  return createEntity({
    ...init,
    priority: 0,
  });
}

// Foreground decoration (trees, fog, overlays)
export function createForeground(init: PartialEntity): Entity {
  return createEntity({
    ...init,
    priority: 4,
  });
}
