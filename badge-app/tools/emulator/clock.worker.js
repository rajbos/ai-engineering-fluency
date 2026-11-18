// Wraps the badger.github.io MicroPython worker with the emulator's virtual clock.
//
// The page posts { clockTarget: <ms> }; the app's badge.ticks (patched by the
// program emulator.js runs, see CLOCK_PRELUDE there) then advances a fixed step
// per frame until it reaches that target, and stands still otherwise. So what a
// screenshot shows depends only on the scripted steps, never on how fast the
// machine or the browser ran. The message is consumed here and never reaches the
// simulator's own handler.
self.emuClockTarget = 0;
self.addEventListener('message', (event) => {
	const data = event.data;
	if (data && typeof data.clockTarget === 'number') {
		self.emuClockTarget = data.clockTarget;
		event.stopImmediatePropagation();
	}
});
// Imported after the listener is added, so this listener runs before the simulator's onmessage.
await import('/simulator/micropython.worker.js');
