// There'll be only one instance of Mouse.
// (Because $state can't be a plain object field)
// Uses self instead of 'this'

import { onMount } from "svelte";

/** All variables readonly $state */
class Mouse {
    x = $state(0);
    y = $state(0);
    clientX = $state(0);
    clientY = $state(0);
    dx = $state(0);
    dy = $state(0);
    
    /** Call me in some component */
    init() {
        onMount(() => {
            document.addEventListener('mousemove', self.mousemove);
            return () => {
                document.removeEventListener('mousemove', self.mousemove);
            };
        });
    }

    private mousemove(e: MouseEvent) {
        self.dx = e.clientX - self.clientX;
        self.dy = e.clientY - self.clientY;
        self.clientX = e.clientX;
        self.clientY = e.clientY;
        self.x = e.offsetX;
        self.y = e.offsetY;
    }
};

const self = new Mouse();
export const mouse = self as Readonly<Mouse>;