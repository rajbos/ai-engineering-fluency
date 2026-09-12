
		class Tracker {
			private handlers(): Record<string, (m: any) => void> {
				return {
					loadRepoPrStats: () => {},
					usageWebviewReady: () => {},
				};
			}
		}
		void Tracker;
	