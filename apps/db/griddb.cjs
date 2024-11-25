// eslint-disable-next-line no-undef
// const griddb = require('griddb-node-api');
const griddb = await import('griddb-node-api');

const containerName = 'myContainer';

const clusterName = process.env.GRIDDB_CLUSTER_NAME
const username = process.env.GRIDDB_USERNAME
const password = process.env.GRIDDB_PASSWORD

console.log(clusterName, username, password)

const initStore = async () => {
	const factory = griddb.StoreFactory.getInstance();

	console.log(`initStore.factory: ${factory}`)
	// eslint-disable-next-line no-useless-catch
	try {
		const store = await factory.getStore({
			'clusterName': clusterName,
			'username': username,
			'password': password,
		});

		console.log(`initStore.store: ${store}`)
		return store;
	} catch (e) {
		throw e;
	}
};

// Initialize container but not yet create it
function initContainer() {
	const conInfo = new griddb.ContainerInfo({
		'name': containerName,
		'columnInfoList': [
			['id', griddb.Type.INTEGER],
			['video', griddb.Type.STRING],
			['audio', griddb.Type.STRING],
			['narrative', griddb.Type.STRING],
			['title', griddb.Type.STRING]

		],
		'type': griddb.ContainerType.COLLECTION,
		'rowKey': true,
	});

	console.log(`initContainer.conInfo: ${conInfo}`)
	return conInfo;
}

async function createContainer(store, conInfo) {
	try {
		const collectionDB = await store.putContainer(conInfo, false);
		console.log(`createConteriner.collectionDB: ${collectionDB}`)
		return collectionDB;
	} catch (err) {
		console.error(err);
		throw err;
	}
}

async function initGridDbTS() {
	try {
		const store = await initStore();
		const conInfo = await initContainer();
		const collectionDb = await createContainer(store, conInfo);
		console.log(`initGridDbTS.collectionDb::store::conInfo: ${collectionDb}, ${store}, ${conInfo}`)
		return { collectionDb, store, conInfo };
	} catch (err) {
		console.error(err);
		throw err;
	}
}

async function containersInfo(store) {
	let containers = [];
	for (let index = 0; index < store.partitionController.partitionCount; index++) {
		try {
			const nameList = await store.partitionController.getContainerNames(index, 0, -1);
			for (const element of nameList) {
				const info = await store.getContainerInfo(element);
				if (info.name === containerName) {
					let containerInfo = {
						'Container Info': info.name,
						'Type': info.type == griddb.ContainerType.COLLECTION ? 'Collection' : 'TimeSeries',
						'Column Count': info.columnInfoList.length,
						'Columns': info.columnInfoList.map(column => ({ 'Name': column[0], 'Type': column[1] }))
					};
					containers.push(containerInfo);
				}
			}
		} catch (err) {
			if (err.constructor.name == 'GSException') {
				for (let i = 0; i < err.getErrorStackSize(); i++) {
					console.error(`Error ${i}: ${err.getErrorCode(i)}, ${err.getMessage(i)}`);
				}
			} else {
				console.error(err);
			}
		}
	}
	return containers;
}

/**
 * Insert data to GridDB
 */
async function insert(data, container) {
	try {
		await container.put(data);
		return { status: true };
	} catch (err) {
		if (err.constructor.name == 'GSException') {
			for (var i = 0; i < err.getErrorStackSize(); i++) {
				console.log('[%d]', i);
				console.log(err.getErrorCode(i));
				console.log(err.getMessage(i));
			}

			return { status: false, error: err.toString() };
		} else {
			console.log(err);
			return { status: false, error: err };
		}
	}
}

async function multiInsert(data, db) {
	try {
		await db.multiPut(data);
		return { ok: true };
	} catch (err) {
		console.log(err);
		return { ok: false, error: err };
	}
}

async function queryAll(conInfo, store) {
	const sql = `SELECT *`;
	const cont = await store.putContainer(conInfo);
	const query = await cont.query(sql);
	try {
		const rowset = await query.fetch();
		const results = [];

		while (rowset.hasNext()) {
			const row = rowset.next();
			const rowData = {
				id: `${row[0]}`,
				video: `${row[1]}`,
				audio: `${row[2]}`,
				narrative: `${row[3]}`,
				title: `${row[4]}`,
			};
			results.push(rowData);
		}
		return { results, length: results.length };
	} catch (err) {
		console.log(err);
		return err;
	}
}

async function queryByID(id, conInfo, store) {
	try {
		const cont = await store.putContainer(conInfo);
		const row = await cont.get(parseInt(id));
		const result = [];
		result.push(row);
		return result;
	} catch (err) {
		console.log(err);
	}
}

// Delete container
async function dropContainer(store, containerName, conInfo) {
	store
		.dropContainer(containerName)
		.then(() => {
			console.log('drop ok');
			return store.putContainer(conInfo);
		})
		.catch((err) => {
			if (err.constructor.name == 'GSException') {
				for (var i = 0; i < err.getErrorStackSize(); i++) {
					console.log('[%d]', i);
					console.log(err.getErrorCode(i));
					console.log(err.getMessage(i));
				}
			} else {
				console.log(err);
			}
		});
}

module.exports = {
	initStore,
	initContainer,
	initGridDbTS,
	createContainer,
	insert,
	multiInsert,
	queryAll,
	dropContainer,
	containersInfo,
	containerName,
	queryByID,
};