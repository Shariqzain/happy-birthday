import { useEffect, useRef } from 'react';
import './DriftWall.css';

const items = [
  { image: '1.jpeg'},
  { image: '2.jpeg'},
  { image: '3.jpeg'},
  { image: '4.jpeg'},
  { image: '5.jpeg'},
  { image: '6.jpeg'},
  { image: '7.jpeg'},
  { image: '8.jpeg'},
  { image: '9.jpeg'},
  { image: '10.jpeg'},
  { image: '11.jpeg'},
  { image: '12.jpeg'},
  { image: '13.jpeg'},
  { image: '14.jpeg'},
  { image: '15.jpeg'},
  { image: '16.jpeg'},
  { image: '17.jpg'},
  { image: '18.png'},
];

function shuffledItems(group) {
  return [...group].sort(() => Math.random() - 0.5);
}

const desktopColumnItems = Array.from({ length: 9 }, (_, columnIndex) => {
  const group = columnIndex % 2 === 0 ? items.slice(0, 8) : items.slice(8);
  return shuffledItems(group);
});

const mobileColumnItems = Array.from({ length: 4 }, () => shuffledItems(items));

function DriftColumns({ columns, className }) {
  return (
    <div className={`drift-wall-columns ${className}`}>
      {columns.map((column, columnIndex) => (
        <div className={`drift-column drift-column-${columnIndex + 1}`} key={columnIndex}>
          {column.map((item, itemIndex) => (
            <figure className="drift-tile" key={`${item.image}-${itemIndex}`}>
              <img src={`${import.meta.env.BASE_URL}${item.image}`} alt={`Memory ${item.image}`} />
              <figcaption>{item.image}</figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  );
}

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

  return (
    <section className="drift-wall-section" aria-label="Memories gallery">
      <div className="drift-wall" ref={wallRef}>
        <DriftColumns columns={desktopColumnItems} className="drift-wall-columns-desktop" />
        <DriftColumns columns={mobileColumnItems} className="drift-wall-columns-mobile" />
      </div>
    </section>
  );
}

export default DriftWall;
