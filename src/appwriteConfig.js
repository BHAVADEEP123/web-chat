import { Client, Databases} from 'appwrite';
const client = new Client();

export const PROJECTID = '660e725ee73ea84439f9';
export const DATABASEID = '660e74be6c80df6dfb6c';
export const COLLECTIONID_MESSAGES = '660e74c43d9773c460b4';

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('660e725ee73ea84439f9');
export const databases = new Databases(client);

export default client;