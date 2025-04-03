import fs from "node:fs";
import { join } from "node:path";
import { parse } from "csv-parse/sync";

const getCSVManufacturerParts = async (filename: string): Promise<string[]> => {
	const csvPath = join(process.cwd(), `data/${filename}`);

	if (!fs.existsSync(csvPath)) {
		throw new Error(`file not found: ${csvPath}`);
	}

	const content = fs.readFileSync(csvPath, "utf-8");
	const rows = parse(content, { columns: true, skip_empty_lines: true });

	if (rows.length === 0) {
		throw new Error("csv file is empty");
	}

	const firstRow = rows[0];
	const lcscField = Object.keys(firstRow).find(
		(header) =>
			header.toLowerCase().includes("lcsc") ||
			header.toLowerCase().includes("part number"),
	);

	if (!lcscField) {
		console.error("could not find lcsc part number column");
		process.exit(1);
	}

	const lcscNumbers = rows
		.map((row: Record<string, unknown>) => row[lcscField])
		.filter((part: unknown) => part && String(part).trim())
		.map((part: unknown) => String(part).trim());

	return lcscNumbers;
};

export default getCSVManufacturerParts;
