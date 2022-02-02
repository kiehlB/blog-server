import * as fs from 'fs';
import * as path from 'path';
import s from '../graphql/schema';

const schema = s;

// const typescriptTypes = generateNamespace('MyGraphQL', schema);

// fs.writeFile(path.join(__dirname, '../types/schema.d.ts'), typescriptTypes, err => {
//   console.log(err);
// });
