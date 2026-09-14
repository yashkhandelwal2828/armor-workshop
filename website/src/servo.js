// Critically damped Cartesian actuator model. SI units, fixed 120 Hz integration.
export const STEP = 1 / 120;
export function stepServo(position, velocity, target, dt = STEP, limits = {}) {
  const omega = 14,
    maxAcceleration = limits.acceleration ?? 5,
    maxSpeed = limits.speed ?? 0.75;
  const acceleration = target
    .clone()
    .sub(position)
    .multiplyScalar(omega * omega)
    .addScaledVector(velocity, -2 * omega);
  acceleration.clampLength(0, maxAcceleration);
  velocity.addScaledVector(acceleration, dt).clampLength(0, maxSpeed);
  position.addScaledVector(velocity, dt);
}
