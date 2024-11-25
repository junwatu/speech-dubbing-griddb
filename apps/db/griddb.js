import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const griddb = require('griddb-node-api');

export default griddb