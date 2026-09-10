import { useEffect, useRef } from 'react';
import './DriftWall.css';

const items = [
  { image: '../public/1.jpeg'},
  { image: '../public/2.jpeg'},
  { image: '../public/3.jpeg'},
  { image: '../public/4.jpeg'},
  { image: '../public/5.jpeg'},
  { image: '../public/6.jpeg'},
  { image: '../public/7.jpeg'},
  { image: '../public/8.jpeg'},
  { image: '../public/9.jpeg'},
  { image: '../public/10.jpeg'},
  { image: '../public/11.jpeg'},
  { image: '../public/12.jpeg'},
  { image: '../public/13.jpeg'},
  { image: '../public/14.jpeg'},
  { image: '../public/15.jpeg'},
  { image: '../public/16.jpeg'},
  { image: '../public/17.jpg'},
  { image: '../public/18.png'},
];

function shuffledItems(group) {
  return [...group].sort(() => Math.random() - 0.5);
}

const columnItems = Array.from({ length: 9 }, (_, columnIndex) => {
  const group = columnIndex % 2 === 0 ? items.slice(0, 8) : items.slice(8);
  return shuffledItems(group);
});

function DriftWall() {
  const wallRef = useRef(null);

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return undefined;

    const handlePointerMove = (event) => {
      const bounds = wall.getBoundingClientRect();
      const pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
      wall.style.setProperty('--pointer-x', `${pointerX * 18}px`);
      wall.style.setProperty('--pointer-y', `${pointerY * 12}px`);
    };

    const resetPointer = () => {
      wall.style.setProperty('--pointer-x', '0px');
      wall.style.setProperty('--pointer-y', '0px');
    };

    wall.addEventListener('pointermove', handlePointerMove);
    wall.addEventListener('pointerleave', resetPointer);
    return () => {
      wall.removeEventListener('pointermove', handlePointerMove);
      wall.removeEventListener('pointerleave', resetPointer);
    };
  }, []);

  const columns = Array.from({ length: 9 }, (_, columnIndex) => (
    <div className={`drift-column drift-column-${columnIndex + 1}`} key={columnIndex}>
      {columnItems[columnIndex].map((item) => (
        <figure className="drift-tile" key={item.title}>
          <img src={item.image} alt={`Memory ${item.title}`} />
          <figcaption>{item.title}</figcaption>
        </figure>
      ))}
    </div>
  ));

  return (
    <section className="drift-wall-section" aria-label="Memories gallery">
      <div className="drift-wall" ref={wallRef}>
        <div className="drift-wall-columns">{columns}</div>
      </div>
    </section>
  );
}

export default DriftWall;
