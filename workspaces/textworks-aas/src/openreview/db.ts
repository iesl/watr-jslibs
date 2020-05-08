import path from "path";
import fs from "fs-extra";
import _ from 'lodash';

import {
  Sequelize,
  Transaction,
  // BuildOptions,
  // HasManyGetAssociationsMixin,
  // HasManyAddAssociationMixin,
  // HasManyHasAssociationMixin,
  // HasManyCountAssociationsMixin,
  // HasManyCreateAssociationMixin
} from 'sequelize';

import { defineTables } from './db-tables';

export function dbStorageFile(dbDataPath: string): string {
  return path.resolve(dbDataPath, 'openreview-db.sqlite');
}

export function deleteStorage(storagePath: string): void {
  if (fs.existsSync(storagePath)) {
    fs.removeSync(storagePath);
  }
}

// storage: storagePath ? storagePath : ':memory:',

export async function initSequelize(): Promise<Sequelize> {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    username: 'watrworker',
    password: 'watrpass',
    database: 'textworks_or_onramp',
    logging: false, // logging: console.log,
  });

  return sequelize
    .authenticate()
    .then(() => {
      return sequelize;
    })
    .catch((err: any) => {
      console.error('Unable to connect to the database:', err);
      throw err;
    });
}

export interface Database {
  sql: Sequelize;
  run: <R>(f: (db: Sequelize) => Promise<R>) => Promise<R>;
  runTransaction: <R>(f: (db: Sequelize, t: Transaction) => Promise<R>) => Promise<R>;
  unsafeResetDatabase: () => Promise<Database>;
}

export async function runQuery<R>(sql: Sequelize, f: (sql: Sequelize) => Promise<R>): Promise<R> {
  return f(sql)
    .catch((error) => {
      console.log('runQuery: error:', error);
      throw error;
    });
}

export async function runTransaction<R>(
  sql: Sequelize,
  f: (db: Sequelize, t: Transaction) => Promise<R>
): Promise<R> {
  return runQuery(sql, async db => {
    const transaction = await db.transaction();
    return f(db, transaction)
      .then(async (r) => {
        return transaction.commit().then(() => r);
      })
      .catch(async (error) => {
        return transaction.rollback().then(() => {
          console.log('runTransaction: error:', error);
          throw error;
        })
      })
  })
}

export async function openDatabase(): Promise<Database> {
  return initSequelize()
    .then(async sql => {
      defineTables(sql);
      // Create tables if they don't exist, else no-op
      await sql.sync();

      const run = _.curry(runQuery)(sql);
      const runT = _.curry(runTransaction)(sql);
      const unsafeResetDatabase = async () => {
        await sql.drop();
        return sql
          .sync({ force: true })
          .then(async () => {
            await sql.close();
            return openDatabase();
          });
      };

      return {
        unsafeResetDatabase,
        sql,
        run,
        runTransaction: runT,
      };
    });
}
