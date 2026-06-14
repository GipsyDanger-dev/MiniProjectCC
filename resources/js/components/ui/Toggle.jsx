import React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

export default function Toggle({ checked, onCheckedChange, disabled, ...props }) {
    return (
        <SwitchPrimitive.Root
            data-radix-switch-root
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            {...props}
        >
            <SwitchPrimitive.Thumb data-radix-switch-thumb />
        </SwitchPrimitive.Root>
    );
}
