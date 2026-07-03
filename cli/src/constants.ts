/**
 * Environmental impact constants used for calculating CO₂, water usage,
 * and equivalent comparisons from AI token usage.
 */
export const ENVIRONMENTAL = {
	CO2_PER_1K_TOKENS: 0.2,                  // gCO2e per 1000 tokens
	CO2_ABSORPTION_PER_TREE_PER_YEAR: 21000,  // grams CO2 per tree/year
	WATER_USAGE_PER_1K_TOKENS: 0.3,           // liters per 1000 tokens
	// Context comparison constants
	CO2_PER_KM_DRIVING: 120,                  // grams CO2 per km for average car
	CO2_PER_PHONE_CHARGE: 8.22,               // grams CO2 per smartphone full charge
	WATER_PER_COFFEE_CUP: 140,                // liters of water per cup of coffee
	CO2_PER_LED_HOUR: 20,                     // grams CO2 per hour for 10W LED bulb
};
