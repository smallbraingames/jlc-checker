import chalk from "chalk";
import ora from "ora";
import pLimit from "p-limit";
import { chromium } from "playwright";
import getCSVManufacturerParts from "./utils/csv";
import getExcelJLCParts from "./utils/excel";
import getJLC from "./utils/jlc";

const CONCURRENCY_LIMIT = 8;

const main = async () => {
	const jlcParts = await getExcelJLCParts("current.xls");
	const trueManufacturerParts =
		await getCSVManufacturerParts("canonical/bom.csv");

	const spinner = ora(`resolving JLC parts: 0/${jlcParts.length}`).start();

	const browser = await chromium.launch({ headless: false });

	const limit = pLimit(CONCURRENCY_LIMIT);
	let completed = 0;

	const tasks = jlcParts.map((part) =>
		limit(async () => {
			const result = await getJLC(browser, part);
			completed++;
			spinner.text = `resolving JLC parts: ${completed}/${jlcParts.length}`;
			return result;
		}),
	);

	const jlcResults = await Promise.all(tasks);
	const jlcManufacturerParts = jlcResults.map(
		(jlcPart) => jlcPart?.manufacturerPartNumber,
	);

	await browser.close();
	spinner.succeed(`resolved ${jlcParts.length} JLC parts`);

	console.log(chalk.blue("Matching parts:"));
	const intersection = trueManufacturerParts.filter((part) =>
		jlcManufacturerParts.includes(part),
	);
	for (const part of intersection) {
		console.log(`  ${part}`);
	}

	console.log(chalk.yellow("\nJLC parts not in canonical parts:"));
	const jlcOnly = jlcManufacturerParts.filter(
		(part) => part && !trueManufacturerParts.includes(part),
	);
	for (const part of jlcOnly) {
		console.log(`  ${part}`);
	}

	console.log(chalk.magenta("\nCanonical parts not in JLC parts:"));
	const canonicalOnly = trueManufacturerParts.filter(
		(part) => !jlcManufacturerParts.includes(part),
	);
	for (const part of canonicalOnly) {
		console.log(`  ${part}`);
	}
};

main();
