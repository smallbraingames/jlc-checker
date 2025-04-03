import { type Browser, chromium } from "playwright";

const TIMEOUT = 5_000;

type JLCPart = {
	jlcPartNumber: string;
	manufacturerPartNumber: string;
	description: string;
	manufacturer: string;
};

const getJLC = async (
	browser: Browser,
	partNumber: string,
): Promise<JLCPart | undefined> => {
	const context = await browser.newContext({
		userAgent:
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
	});

	const page = await context.newPage();
	await page.goto("https://jlcpcb.com/parts");

	await page.fill(
		'input[placeholder="Search by Part # / Keyword"]',
		partNumber,
	);
	await page.keyboard.press("Enter");

	await page.waitForLoadState("networkidle");

	await page.waitForSelector(".el-table__body", { timeout: TIMEOUT });

	const tableRowExists = await page.$(".el-table__row.cursor-pointer");
	if (!tableRowExists) {
		console.warn(`no results found for part number: ${partNumber}`);
		await browser.close();
		return undefined;
	}

	await page.click(".el-table__row.cursor-pointer");
	await page.waitForSelector(".detail-desc-container", { timeout: TIMEOUT });

	const details = await page.evaluate(() => {
		const result: JLCPart = {
			jlcPartNumber: "",
			manufacturerPartNumber: "",
			description: "",
			manufacturer: "",
		};

		const jlcPartElement = document.querySelector(
			".el-form-item:nth-child(3) .component-text",
		);
		if (jlcPartElement) {
			result.jlcPartNumber = jlcPartElement.textContent?.trim() || "";
		}

		const mfrPartElement = document.querySelector(
			".el-form-item:nth-child(2) .component-text",
		);
		if (mfrPartElement) {
			result.manufacturerPartNumber = mfrPartElement.textContent?.trim() || "";
		}

		const descriptionElement = document.querySelector(
			".el-form-item:nth-child(5) .component-text",
		);
		if (descriptionElement) {
			result.description = descriptionElement.textContent?.trim() || "";
		}

		const manufacturerElement = document.querySelector(
			".el-form-item:nth-child(1) .component-text",
		);
		if (manufacturerElement) {
			result.manufacturer = manufacturerElement.textContent?.trim() || "";
		}

		return result;
	});

	if (details.jlcPartNumber !== partNumber) {
		console.warn(
			`part number mismatch: requested ${partNumber} but found ${details.jlcPartNumber}`,
		);
		return undefined;
	}
	return details;
};

export default getJLC;
