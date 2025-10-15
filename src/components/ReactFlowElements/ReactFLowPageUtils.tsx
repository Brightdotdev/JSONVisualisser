import { Panel, useReactFlow } from "@xyflow/react";
import { Button } from "../ui/button";
import { useCallback } from "react";
import { Minus, Plus } from "lucide-react";
import { RiFullscreenLine } from "react-icons/ri";




/* ------------------ Resize Buttons ------------------ */
type ResizeButtonsProps = {
  method: () => void;
  labelText: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const ResizeButtons = ({ method, labelText, icon: Icon }: ResizeButtonsProps) => (
  <Button
    variant="outline"
    size="icon"
    className="text-foreground hover:text-foreground/90 rounded-none shadow-none first:rounded-s-sm last:rounded-e-sm size-10 focus-visible:z-10 bg-card"
    onClick={method}
    aria-label={labelText}
  >
    <Icon className="size-5" aria-hidden="true" />
  </Button>
);




export const BottomPannel = () =>{
    const { fitView, zoomIn, zoomOut } = useReactFlow();
  

const onFitView = useCallback(() => {
fitView({ padding: 0.2 });
}, [fitView]);


  return(
      <Panel
          position="bottom-right"
          className="inline-flex -space-x-px rounded-sm shadow-xs rtl:space-x-reverse bg-primary"
        >
          {[
            { method: zoomIn, labelText: "Zoom in", icon: Plus },
            { method: zoomOut, labelText: "Zoom out", icon: Minus },
            { method: onFitView, labelText: "Fit view", icon: RiFullscreenLine },
          ].map(({ method, labelText, icon }) => (
            <ResizeButtons
              key={labelText}
              method={method}
              labelText={labelText}
              icon={icon}
            />
          ))}
        </Panel>
  )
}