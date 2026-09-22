export function resolveAttack({ attacker, target, weapon, rng }) {
  const staminaCost = weapon.staminaCost ?? 0;
  const attackerStamina = Math.max(0, (attacker.stamina ?? 0) - staminaCost);
  const staminaFactor = (attacker.stamina ?? 0) >= staminaCost ? 1 : .5;
  const chance = Math.max(.05, Math.min(.95, (weapon.accuracy ?? .5) + (attacker.skill ?? 0) * .1)) * staminaFactor;
  const hit = rng.next() < chance;
  const damage = hit ? Math.max(0, Math.round((weapon.damage ?? 0) * (.9 + rng.next() * .2))) : 0;
  return { hit, damage, targetHealth: Math.max(0, (target.health ?? 0) - damage), attackerStamina, noise: weapon.noise ?? 0 };
}
