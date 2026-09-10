import { useEffect, useRef } from 'react';

const COLORS = ['#ff1732', '#ef2341', '#d91439', '#ff4961', '#e41d54', '#ff3151'];
const TAU = Math.PI * 2;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createBalloon(x, y, radius, colors) {
  return {
    x,
    y,
    radius,
    mass: radius * radius,
    velocityX: 0,
    velocityY: 0,
    color: colors[Math.floor(Math.random() * colors.length)],
    squash: 1,
  };
}

function makeBalloons(width, height, colors) {
  const baseRadius = Math.max(96, Math.min(158, Math.min(width, height) * 0.18));
  const spacing = baseRadius * 0.78;
  const columns = Math.ceil(width / spacing) + 3;
  const rows = Math.ceil(height / spacing) + 3;
  const balloons = [];

  for (let row = -1; row < rows; row += 1) {
    for (let column = -1; column < columns; column += 1) {
      const radius = randomBetween(baseRadius * 0.86, baseRadius * 1.28);
      const jitterX = randomBetween(-spacing * 0.28, spacing * 0.28);
      const jitterY = randomBetween(-spacing * 0.28, spacing * 0.28);
      const offsetX = row % 2 === 0 ? 0 : spacing * 0.5;
      balloons.push(createBalloon(column * spacing + offsetX + jitterX, row * spacing + jitterY, radius, colors));
    }
  }

  const extraCount = Math.ceil((width * height) / 28000);
  for (let index = 0; index < extraCount; index += 1) {
    balloons.push(createBalloon(randomBetween(-baseRadius, width + baseRadius), randomBetween(-baseRadius, height + baseRadius), randomBetween(baseRadius * 0.9, baseRadius * 1.3), colors));
  }

  return balloons;
}

function drawBalloon(context, balloon) {
  const { x, y, radius } = balloon;
  const width = radius * 1.42;
  const height = radius * 1.78;
  const scaleX = 1 + (balloon.squash - 1) * 0.35;
  const scaleY = 1 - (balloon.squash - 1) * 0.2;

  context.save();
  context.translate(x, y);
  context.scale(scaleX, scaleY);

  const gradient = context.createRadialGradient(-width * 0.25, -height * 0.33, radius * 0.08, 0, 0, width);
  gradient.addColorStop(0, '#fff4f7');
  gradient.addColorStop(0.12, balloon.color);
  gradient.addColorStop(0.72, balloon.color);
  gradient.addColorStop(1, '#a9082d');

  context.beginPath();
  context.moveTo(0, -height * 0.56);
  context.bezierCurveTo(width * 0.47, -height * 0.58, width * 0.54, -height * 0.08, width * 0.42, height * 0.18);
  context.bezierCurveTo(width * 0.31, height * 0.43, width * 0.12, height * 0.52, 0, height * 0.64);
  context.bezierCurveTo(-width * 0.12, height * 0.52, -width * 0.31, height * 0.43, -width * 0.42, height * 0.18);
  context.bezierCurveTo(-width * 0.54, -height * 0.08, -width * 0.47, -height * 0.58, 0, -height * 0.56);
  context.fillStyle = gradient;
  context.fill();

  context.strokeStyle = 'rgba(117, 0, 31, 0.35)';
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.ellipse(-width * 0.22, -height * 0.28, width * 0.1, height * 0.2, -0.35, 0, TAU);
  context.fillStyle = 'rgba(255, 255, 255, 0.46)';
  context.fill();

  context.beginPath();
  context.moveTo(-width * 0.06, height * 0.61);
  context.lineTo(width * 0.06, height * 0.61);
  context.lineTo(0, height * 0.72);
  context.closePath();
  context.fillStyle = '#a9082d';
  context.fill();

  context.beginPath();
  context.moveTo(0, height * 0.7);
  context.bezierCurveTo(width * 0.34, height * 0.92, -width * 0.3, height * 1.08, width * 0.04, height * 1.32);
  context.strokeStyle = 'rgba(64, 28, 44, 0.72)';
  context.lineWidth = Math.max(1.5, radius * 0.018);
  context.stroke();
  context.restore();
}

function PhysicsBalloonOverlay({ onCleared, balloonColors = COLORS }) {
  const canvasRef = useRef(null);
  const onClearedRef = useRef(onCleared);

  useEffect(() => {
    onClearedRef.current = onCleared;
  }, [onCleared]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const pointer = { x: 0, y: 0, previousX: 0, velocityX: 0, active: false };
    let width = window.innerWidth;
    let height = window.innerHeight;
    let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    let balloons = makeBalloons(width, height, balloonColors);
    let frameId;
    let lastTime = performance.now();
    let cleared = false;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const updatePointer = (event) => {
      const nextX = event.clientX;
      pointer.x = nextX;
      pointer.y = event.clientY;
      pointer.velocityX = nextX - pointer.previousX;
      pointer.previousX = nextX;
      pointer.active = true;
    };

    const resolveCollisions = () => {
      for (let firstIndex = 0; firstIndex < balloons.length; firstIndex += 1) {
        const first = balloons[firstIndex];
        for (let secondIndex = firstIndex + 1; secondIndex < balloons.length; secondIndex += 1) {
          const second = balloons[secondIndex];
          const differenceX = second.x - first.x;
          const differenceY = second.y - first.y;
          const minimumDistance = first.radius * 0.62 + second.radius * 0.62;
          const distanceSquared = differenceX * differenceX + differenceY * differenceY;
          if (distanceSquared >= minimumDistance * minimumDistance) continue;

          const distance = Math.sqrt(distanceSquared) || 0.001;
          const normalX = differenceX / distance;
          const normalY = differenceY / distance;
          const overlap = minimumDistance - distance;
          const inverseMassTotal = 1 / first.mass + 1 / second.mass;
          first.x -= normalX * overlap * (1 / first.mass) / inverseMassTotal;
          first.y -= normalY * overlap * (1 / first.mass) / inverseMassTotal;
          second.x += normalX * overlap * (1 / second.mass) / inverseMassTotal;
          second.y += normalY * overlap * (1 / second.mass) / inverseMassTotal;

          const relativeVelocityX = second.velocityX - first.velocityX;
          const relativeVelocityY = second.velocityY - first.velocityY;
          const separatingVelocity = relativeVelocityX * normalX + relativeVelocityY * normalY;
          if (separatingVelocity > 0) continue;

          const restitution = 0.74;
          const impulse = -(1 + restitution) * separatingVelocity / inverseMassTotal;
          first.velocityX -= impulse * normalX / first.mass;
          first.velocityY -= impulse * normalY / first.mass;
          second.velocityX += impulse * normalX / second.mass;
          second.velocityY += impulse * normalY / second.mass;
          first.squash = 1.12;
          second.squash = 1.12;
        }
      }
    };

    const update = (deltaTime) => {
      const delta = Math.min(deltaTime / 16.67, 2);
      const mouseSpeed = Math.min(Math.abs(pointer.velocityX), 55);
      const mouseDirection = Math.sign(pointer.velocityX);
      const interactionRadius = 230;
      const gravity = 0.018;
      const buoyancy = -0.018;

      balloons.forEach((balloon) => {
        const distanceX = balloon.x - pointer.x;
        const distanceY = balloon.y - pointer.y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY) || 1;
        if (pointer.active && mouseSpeed > 0.5 && distance < interactionRadius) {
          const falloff = 1 - distance / interactionRadius;
          const push = mouseDirection * mouseSpeed * falloff * 0.54;
          balloon.velocityX += push / Math.max(0.7, balloon.mass / 5000);
          balloon.velocityY += (distanceY / distance) * mouseSpeed * falloff * 0.1;
        }

        balloon.velocityY += (gravity + buoyancy) * delta;
        balloon.velocityX *= Math.pow(0.985, delta);
        balloon.velocityY *= Math.pow(0.985, delta);
        balloon.x += balloon.velocityX * delta;
        balloon.y += balloon.velocityY * delta;
        balloon.squash += (1 - balloon.squash) * 0.12 * delta;
      });

      resolveCollisions();
      balloons = balloons.filter((balloon) => balloon.x + balloon.radius > -220 && balloon.x - balloon.radius < width + 220 && balloon.y + balloon.radius > -220 && balloon.y - balloon.radius < height + 220);
      pointer.velocityX *= 0.72;

      if (!cleared && balloons.length <= 2) {
        cleared = true;
        onClearedRef.current?.();
      }
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      balloons.forEach((balloon) => drawBalloon(context, balloon));
    };

    const loop = (time) => {
      update(time - lastTime);
      lastTime = time;
      draw();
      if (!cleared) frameId = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', updatePointer);
    canvas.addEventListener('pointerdown', updatePointer);
    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', updatePointer);
      canvas.removeEventListener('pointerdown', updatePointer);
    };
  }, []);

  return <canvas ref={canvasRef} className="physics-balloon-overlay" aria-label="Move your cursor to clear the balloons" />;
}

export default PhysicsBalloonOverlay;
