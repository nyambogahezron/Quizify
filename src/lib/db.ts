import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('quizapp.db');

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          username TEXT UNIQUE NOT NULL,
          level INTEGER DEFAULT 1,
          created_at INTEGER DEFAULT (strftime('%s', 'now'))
        );`,
        [],
        () => resolve(true),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const createUser = (name: string, username: string) => {
  return new Promise((resolve, reject) => {
    const id =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO users (id, name, username) VALUES (?, ?, ?)',
        [id, name, username],
        (_, { insertId, rows }) => resolve({ id, name, username, level: 1 }),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getUser = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM users LIMIT 1',
        [],
        (_, { rows: { _array } }) => resolve(_array[0]),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};
