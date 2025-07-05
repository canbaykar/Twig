// There'll be only one instance of Mouse.
// (Because $state can't be a plain object field)
// Uses self instead of 'this'
/** All variables readonly $state */
class Mouse {
    element: HTMLElement | null = null;
    x = $state(0);
    y = $state(0);
    clientX = $state(0);
    clientY = $state(0);
    dx = $state(0);
    dy = $state(0);
    
    /** Call me in some element as a svelte action */
    action(element: HTMLElement) {
        self.attach(element);
        return {
            destroy() {
                self.detach(element);
            }
        };
    }

    private attach(element: HTMLElement) {
        if (self.element) self.detach(self.element);
        self.element = element;
        
        element.addEventListener('mousemove', self.mousemove);
    }

    private detach(element: HTMLElement) {
        if (self.element !== element) return;
        self.element = null;

        element.removeEventListener('mousemove', self.mousemove);
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