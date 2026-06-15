const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("../lib/generated/prisma");

const TABLES = [
  "User",
  "Product",
  "Transaction",
  "TransactionItem",
  "StoreSetting",
  "Notification",
  "ActivityLog",
  "UserCart",
  "UserCartItem",
];

const PROJECT_ROOT = path.resolve(__dirname, "..");

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {};

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((result, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return result;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) return result;

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      result[key] = value;
      return result;
    }, {});
};

const quoteIdent = (value) => `"${String(value).replace(/"/g, '""')}"`;

const getColumns = async (client, table) => {
  const rows = await client.$queryRawUnsafe(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
    `,
    table
  );
  return rows.map((row) => row.column_name);
};

const getTableCount = async (client, table) => {
  try {
    const rows = await client.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS count FROM ${quoteIdent(table)}`
    );
    return rows[0]?.count ?? 0;
  } catch {
    return null;
  }
};

const getCounts = async (client) => {
  const counts = {};
  for (const table of TABLES) {
    counts[table] = await getTableCount(client, table);
  }
  return counts;
};

const getRows = async (client, table, columns) => {
  if (columns.length === 0) return [];

  const columnSql = columns.map(quoteIdent).join(", ");
  return client.$queryRawUnsafe(`SELECT ${columnSql} FROM ${quoteIdent(table)} ORDER BY 1 ASC`);
};

const upsertRows = async (client, table, columns, rows) => {
  if (rows.length === 0 || columns.length === 0) return 0;

  const columnSql = columns.map(quoteIdent).join(", ");
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
  const updateColumns = columns.filter((column) => column !== "id");
  const updateSql =
    updateColumns.length > 0
      ? `DO UPDATE SET ${updateColumns
          .map((column) => `${quoteIdent(column)} = EXCLUDED.${quoteIdent(column)}`)
          .join(", ")}`
      : "DO NOTHING";
  const sql = `
    INSERT INTO ${quoteIdent(table)} (${columnSql})
    VALUES (${placeholders})
    ON CONFLICT ("id") ${updateSql}
  `;

  for (const row of rows) {
    await client.$executeRawUnsafe(
      sql,
      ...columns.map((column) => row[column] ?? null)
    );
  }

  return rows.length;
};

const resetSequence = async (client, table) => {
  const quotedTableName = `public.${quoteIdent(table)}`;
  const rows = await client.$queryRawUnsafe(
    "SELECT pg_get_serial_sequence($1, 'id') AS sequence_name",
    quotedTableName
  );
  const sequenceName = rows[0]?.sequence_name;
  if (!sequenceName) return;

  await client.$executeRawUnsafe(
    `
    SELECT setval(
      $1::regclass,
      COALESCE((SELECT MAX("id") FROM ${quoteIdent(table)}), 0) + 1,
      false
    )
    `,
    sequenceName
  );
};

const migrateTable = async (local, remote, table) => {
  const localColumns = await getColumns(local, table);
  const remoteColumns = await getColumns(remote, table);
  const commonColumns = remoteColumns.filter((column) => localColumns.includes(column));

  if (!commonColumns.includes("id")) {
    return { table, status: "skipped", reason: "missing id column", rows: 0 };
  }

  const rows = await getRows(local, table, commonColumns);
  const migrated = await upsertRows(remote, table, commonColumns, rows);
  await resetSequence(remote, table);

  return { table, status: "ok", rows: migrated, columns: commonColumns.length };
};

const main = async () => {
  const mode = process.argv[2] || "check";
  const env = { ...loadEnvFile(path.join(PROJECT_ROOT, ".env")), ...process.env };
  const localUrl = env.LOCAL_DATABASE_URL || env.OLD_DATABASE_URL;
  const remoteUrl = env.SUPABASE_MIGRATION_DATABASE_URL || env.DIRECT_URL || env.DATABASE_URL;

  if (!localUrl) {
    throw new Error("Isi LOCAL_DATABASE_URL untuk menunjuk PostgreSQL lokal lama.");
  }
  if (!remoteUrl) {
    throw new Error("DATABASE_URL/DIRECT_URL Supabase belum tersedia.");
  }

  const local = new PrismaClient({ datasources: { db: { url: localUrl } } });
  const remote = new PrismaClient({ datasources: { db: { url: remoteUrl } } });

  try {
    const before = {
      local: await getCounts(local),
      supabase: await getCounts(remote),
    };
    console.log(JSON.stringify({ before }, null, 2));

    if (mode !== "migrate") return;

    const migrated = [];
    for (const table of TABLES) {
      migrated.push(await migrateTable(local, remote, table));
    }

    const after = {
      local: await getCounts(local),
      supabase: await getCounts(remote),
    };
    console.log(JSON.stringify({ migrated, after }, null, 2));
  } finally {
    await local.$disconnect();
    await remote.$disconnect();
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
