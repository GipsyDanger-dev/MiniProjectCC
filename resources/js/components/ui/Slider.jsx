import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

const Slider = React.forwardRef(({ className, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        className={`relative flex items-center select-none touch-none w-full h-5 ${className || ""}`}
        {...props}
    >
        <SliderPrimitive.Track data-radix-slider-track>
            <SliderPrimitive.Range data-radix-slider-range />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb data-radix-slider-thumb />
    </SliderPrimitive.Root>
));
Slider.displayName = "Slider";

export default Slider;
