import griddb from "./griddb.js";

const factory = griddb.StoreFactory.getInstance();

const notificationMember = process.env.IP_NOTIFICATION_MEMBER;
const clusterName = process.env.GRIDDB_CLUSTER_NAME;
const username = process.env.GRIDDB_USERNAME;
const password = process.env.GRIDDB_PASSWORD;

const store = factory.getStore({
	"notificationMember": notificationMember,
	"clusterName": clusterName,
	"username": username,
	"password": password
});

export default store
