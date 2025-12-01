import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

async function do_wasm_load() {

  const MANUAL_BUNDLES = {
    mvp: {
      mainModule: duckdb_wasm,
      mainWorker: mvp_worker,
    },
    eh: {
      mainModule: duckdb_wasm_eh,
      mainWorker: eh_worker,
    },
  };
// Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
// Instantiate the asynchronus version of DuckDB-wasm
  const worker = new Worker(bundle.mainWorker);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  console.log('Starting duck connection...')
  var blob = new Blob(["(" + bundle.mainWorker.toString() + ")()"]);
  const conn = await db.connect(); // Connect to db
  console.log('Completed duck connection...')
  let q = await conn.query('PRAGMA version');
  console.log("Version: ", q);
  window.nu_duck = {};
  window.nu_duck.conn = conn;
  window.nu_duck.db = db;
  window.nu_duck.worker = worker;
  console.log('duckdb wasm loading complete. variables available as window.nu_duck.conn, window.nu_duck.db and window.nu_duck.worker')

}

async function do_version_check() {
  let q = await window.nu_duck.conn.query(` select * from pragma_version();`); // Returns v = 101
  console.log('**************************************************')
  console.log("Query result for pragma_version here: ...")
  console.log(q);
  console.log('**************************************************')
  let xx = JSON.parse(JSON.stringify(q.toArray()));
  console.log(xx);
}

async function do_basic_queries() {

// Basic query
  console.log("Basic query");
  let q = await window.nu_duck.conn.query(`SELECT count(*)::INTEGER as v FROM generate_series(0, 100) t(v)`); // Returns v = 101
  console.log("Query result (Arrow Table):", q);

  q = await window.nu_duck.conn.query(` select * from pragma_version();`); // Returns v = 101
  console.log("Query result pragma_version ):", q);

// Copy of query result (JSON instead of Arrow Table)
  console.log('Query result copy (JSON):', JSON.parse(JSON.stringify(q.toArray())));
  console.log('');

// Prepare query
  console.log("Prepared query statement")
  const stmt = await window.nu_duck.conn.prepare( `SELECT (v + ?) as v FROM generate_series(0, 1000) as t(v);` );

// ... and run the query with materialized results
  const res = await stmt.query(234); // Returns 1001 entries ranging from v = 234 to 1,234
  console.log("Statement result (Table):", res);
  console.log('Statement result copy (JSON):',
    // Bug fix explained at: https://github.com/GoogleChromeLabs/jsbi/issues/30
    JSON.parse(JSON.stringify(res.toArray(), (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
    ))
  );
}


async function do_close() {
  // Closing everything
  await window.nu_duck.conn.close();
  await window.nu_duck.db.terminate();
  await window.nu_duck.worker.terminate();
  window.nu_duck = null;
}

// do_version_check();
//do_basic_queries();
// do_close();


export default {
  do_wasm_load,
  do_version_check,
}
