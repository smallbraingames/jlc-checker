import { existsSync } from "node:fs";
import { join } from "node:path";
import xlsx from "node-xlsx";

const getExcelJLCParts = async (filename: string): Promise<string[]> => {
	const excelPath = join(process.cwd(), `data/${filename}`);

	if (!existsSync(excelPath)) {
		throw new Error(`file not found: ${excelPath}`);
	}

	const workbook = xlsx.parse(excelPath);
	const sheet = workbook[0];
	const rows = sheet.data;

	if (rows.length === 0) {
		throw new Error("excel file is empty");
	}

	const headers = rows[0];
	const jlcpcbColIndex = headers.findIndex((header) =>
		String(header).toLowerCase().includes("jlcpcb part"),
	);

	if (jlcpcbColIndex === -1) {
		console.error("could not find jlcpcb part number column");
		process.exit(1);
	}

	const jlcNumbers = rows
		.slice(1)
		.map((row) => row[jlcpcbColIndex])
		.filter((part) => part && String(part).trim())
		.map((part) => String(part).trim());

	return jlcNumbers;
};

export default getExcelJLCParts;
