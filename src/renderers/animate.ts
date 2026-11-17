/**
 * Call `frame` on every animation frame with the elapsed time and the time since
 * the previous frame, both in seconds. Returns a function that stops the loop.
 */
export function animate(frame: (time: number, delta: number) => void): () => void {
    let handle = 0;
    let start: number | undefined;
    let previous = 0;
    let running = true;

    const tick = (now: number) => {
        if (!running) return;
        start ??= now;
        const time = (now - start) / 1000;
        frame(time, time - previous);
        previous = time;
        handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);

    return () => {
        running = false;
        cancelAnimationFrame(handle);
    };
}
