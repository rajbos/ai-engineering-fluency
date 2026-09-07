
		function outer(): Record<string, () => unknown> {
			return {
				realHandler: () => {
					const inner = () => ({ notAHandler: 1 });
					return inner();
				},
			};
		}
		void outer;
	