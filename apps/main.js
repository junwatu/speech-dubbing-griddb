import griddb from './db/griddb.js';
import { getOrCreateContainer, insertData, queryData } from './db/griddbOperations.js';

(async () => {
	try {
		const containerName = "kolom";
		const columnInfoList = [
			["name", griddb.Type.STRING],
			["status", griddb.Type.BOOL],
			["count", griddb.Type.LONG],
			["lob", griddb.Type.BLOB]
		];

		let container = await getOrCreateContainer(containerName, columnInfoList);

		const rowData1 = ["manungso", true, 7, Buffer.from([65, 66, 67, 68, 69, 70, 71, 72, 73, 74])];
		await insertData(container, rowData1);

		const rowData2 = ["haiwan", false, 5, Buffer.from([65, 66, 67, 68, 69, 70, 71, 72, 73, 74])];
		await insertData(container, rowData2);

		await queryData(container);

	} catch (err) {
		console.error("Error in main flow:", err.message);
	}
})();
