import type { Modifier } from "@dnd-kit/core";
import { getEventCoordinates } from "@dnd-kit/utilities";

export const snapCenterToCursor: Modifier = ({
  transform,
  activatorEvent,
  draggingNodeRect,
}) => {
  if (activatorEvent && draggingNodeRect) {
    const activatorCoordinates = getEventCoordinates(activatorEvent);
    if (activatorCoordinates) {
      const offsetX =
        activatorCoordinates.x -
        draggingNodeRect.left -
        draggingNodeRect.width / 2;
      const offsetY =
        activatorCoordinates.y -
        draggingNodeRect.top -
        draggingNodeRect.height / 2;
      return {
        ...transform,
        x: transform.x + offsetX,
        y: transform.y + offsetY,
      };
    }
  }
  return transform;
};
