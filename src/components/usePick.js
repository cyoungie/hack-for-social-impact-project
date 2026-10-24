import { useState } from 'react';

// Drag-and-drop that also works without a mouse: click/Enter an item to pick it up,
// then click/Enter a target to drop it there. Native drag works too.
export function usePick() {
  const [picked, setPicked] = useState(null);

  const itemProps = (id) => ({
    draggable: true,
    'aria-pressed': picked === id,
    onDragStart: (e) => {
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'move';
      setPicked(id);
    },
    onClick: () => setPicked((p) => (p === id ? null : id)),
  });

  const targetProps = (onPlace) => ({
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain') || picked;
      setPicked(null);
      if (id) onPlace(id);
    },
    onClick: () => {
      if (!picked) return;
      const id = picked;
      setPicked(null);
      onPlace(id);
    },
  });

  return { picked, setPicked, itemProps, targetProps };
}
