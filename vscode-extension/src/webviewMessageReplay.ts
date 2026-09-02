import { withTimeout } from './utils/promises';

export interface ReplayableWebviewMessage {
	command: string;
	[key: string]: unknown;
}

type WebviewMessageSender = (message: ReplayableWebviewMessage) => boolean | PromiseLike<boolean>;

export interface WebviewMessagePublishResult {
	/** True when the underlying `postMessage` reported the message as posted. */
	delivered: boolean;
	/** True when the webview had announced readiness at publish time. */
	wasReady: boolean;
}

/**
 * Keeps the latest message for each feature so a webview reload can replay state that was posted
 * before the replacement document registered its message listener.
 *
 * Delivery is deliberately *not* gated on the readiness handshake: a lost or late
 * `usageWebviewReady` must degrade to "the webview may miss this one post", never to
 * "the extension never posts at all". Gating turned a transient race into a permanent
 * "Loading…" hang, because a webview that already had its listener attached was skipped
 * whenever its ready message didn't reach the host. The retained copy covers the opposite
 * race (posted before the replacement document attached its listener).
 */
export class WebviewMessageReplay {
	private readonly latest = new Map<string, ReplayableWebviewMessage>();
	private ready = false;

	public constructor(
		private readonly send: WebviewMessageSender,
		private readonly deliveryTimeoutMs = 2_000,
		private readonly onDeliveryError?: (error: unknown) => void,
	) {}

	public markNotReady(): void {
		this.ready = false;
	}

	public get isReady(): boolean {
		return this.ready;
	}

	public async publish(key: string, message: ReplayableWebviewMessage): Promise<WebviewMessagePublishResult> {
		this.latest.set(key, message);
		const wasReady = this.ready;
		const delivered = await this.deliver(message);
		return { delivered, wasReady };
	}

	/** Re-posts the latest message per feature; called every time the webview announces readiness. */
	public async markReady(): Promise<string[]> {
		this.ready = true;
		const replayed: string[] = [];
		for (const [key, message] of this.latest.entries()) {
			if (await this.deliver(message)) { replayed.push(key); }
		}
		return replayed;
	}

	private async deliver(message: ReplayableWebviewMessage): Promise<boolean> {
		try {
			return await withTimeout(
				Promise.resolve(this.send(message)),
				this.deliveryTimeoutMs,
				`Delivering webview message "${message.command}"`,
			);
		} catch (error) {
			this.onDeliveryError?.(error);
			return false;
		}
	}
}
