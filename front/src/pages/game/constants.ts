// ── Mini-game constants ─────────────────────────────────────────────────────
export const MANA_MAX              = 100;
export const MANA_REGEN            = 10;    // per second
export const SHOOT_COST            = 25;
export const PROJ_SPEED            = 18;
export const PROJ_LIFETIME         = 3000;  // ms
export const PROJ_DAMAGE           = 30;
export const ENEMY_PROJ_SPEED      = 7;
export const ENEMY_PROJ_LIFETIME   = 4500;
export const PLAYER_RADIUS         = 1.5;
export const SPAWN_INTERVAL_START  = 4000; // ms
export const SPAWN_INTERVAL_MIN    = 1400;
export const BEST_SCORE_KEY        = "portfolio_best_score";
export const MANA_PICKUP_INTERVAL  = 6500;  // ms between spawns
export const MANA_PICKUP_LIFETIME  = 8000;  // ms before auto-despawn
export const MANA_PICKUP_AMOUNT    = 40;
export const MANA_PICKUP_RADIUS    = 2.2;

export const ENEMY_DEFS = [
    { color:"#4cc9f0", hp:30,  speed:5,   type:"melee"  as const, damage:15, score:10, radius:1.1, shootInterval:0 },
    { color:"#f72585", hp:20,  speed:3,   type:"ranged" as const, damage:12, score:25, radius:0.9, shootInterval:2400 },
    { color:"#ff9f1c", hp:80,  speed:2.5, type:"melee"  as const, damage:28, score:40, radius:1.4, shootInterval:0 },
];
