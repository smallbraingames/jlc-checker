import { expect, test } from "bun:test";
import { chromium } from "playwright";
import getJLC from "../utils/jlc";

test(
	"getJLC fetches real component data",
	async () => {
		const partNumber = "C14663";
		const browser = await chromium.launch({ headless: false });
		const result = await getJLC(browser, partNumber);
		expect(result).toBeDefined();
		expect(result?.jlcPartNumber).toBeDefined();
		expect(result?.manufacturerPartNumber).toBeDefined();
		expect(result?.description).toBeDefined();
		expect(result?.manufacturer).toBeDefined();

		expect(result?.manufacturerPartNumber).toBe("CC0603KRX7R9BB104");
		expect(result?.jlcPartNumber).toBe("C14663");
	},
	{ timeout: 12_000 },
);

test(
	"getJLC handles invalid part numbers",
	async () => {
		const browser = await chromium.launch({ headless: false });
		const result = await getJLC(browser, "INVALID_PART_XYZ123789");
		expect(result).toBeUndefined();
	},
	{ timeout: 12_000 },
);

test(
	"getJLC fetches data for multiple components",
	async () => {
		const partNumbers = ["C14663", "C86521"];
		const manufacturerNumbers = ["CC0603KRX7R9BB104", "ADS1240E/1K"];

		const browser = await chromium.launch({ headless: false });

		for (const partNumber of partNumbers) {
			const result = await getJLC(browser, partNumber);
			expect(result?.jlcPartNumber).toContain(partNumber);
			expect(result?.manufacturerPartNumber).toBe(
				manufacturerNumbers[partNumbers.indexOf(partNumber)],
			);
			expect(result?.description).toBeTruthy();
		}
	},
	{ timeout: 24_000 },
);
