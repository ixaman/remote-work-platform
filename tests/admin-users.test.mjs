// No credentials or additional dependencies. Run with:
// node --experimental-vm-modules --experimental-strip-types tests/admin-users.test.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { SourceTextModule, SyntheticModule } from "node:vm";
import { validateAdmin, passwordError, emptyState } from "../app/admin/users/validation.ts";

const existingId = "11111111-1111-4111-8111-111111111111";
const newId = "22222222-2222-4222-8222-222222222222";
const ownerId = "bfd2f5f9-6a96-4b70-8b4a-a405b94c8412";
const input = (overrides = {}) => {
  const form = new FormData();
  for (const [key, value] of Object.entries({ name: "Test Admin", email: "ADMIN@EXAMPLE.INVALID", password: "Test-Password-123!", ...overrides })) form.set(key, value);
  return form;
};
const redirect = (url) => { throw new Error(`redirect:${url}`); };

async function load(source, mocks) {
  const module = new SourceTextModule(stripTypeScriptTypes(await readFile(new URL(source, import.meta.url), "utf8")));
  await module.link((specifier) => {
    assert.ok(Object.hasOwn(mocks, specifier), `Unexpected dependency: ${specifier}`);
    const values = mocks[specifier];
    return new SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    });
  });
  await module.evaluate();
  return module.namespace;
}

async function actions(options = {}) {
  const calls = [];
  const target = options.target ?? { user_id: existingId, name: "Test Admin", email: "admin@example.invalid", role: "admin" };
  const api = {
    auth: { admin: {
      createUser: async (value) => { calls.push(["create", value]); return { data: { user: { id: newId } }, error: options.createError ?? null }; },
      deleteUser: async (id) => { calls.push(["delete", id]); return { error: options.deleteError ?? null }; },
      updateUserById: async (id, value) => { calls.push(["password", id, value]); return { error: options.updateError ?? null }; },
    } },
    from: (table) => {
      assert.equal(table, "admins");
      return { insert: async (value) => {
        calls.push(["insert", value]);
        if (options.insertThrows) throw new Error("private database detail");
        return { error: options.insertError ?? null };
      } };
    },
  };
  const namespace = await load("../app/admin/users/actions.ts", {
    "next/cache": { revalidatePath: (path) => calls.push(["refresh", path]) },
    "next/navigation": { redirect, notFound: () => { throw new Error("not-found"); } },
    "../../../lib/auth": { requireSuperAdmin: async () => {
      calls.push(["authorize"]);
      if (options.denied) redirect("/admin");
      return { user: { id: ownerId }, supabase: {} };
    } },
    "../../../lib/supabase/admin": { createAdminClient: () => { calls.push(["client"]); return api; } },
    "./data": { findAdmin: async (_client, id) => {
      calls.push(["lookup", id]);
      if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("not-found");
      return { data: target, error: options.lookupError ?? false };
    } },
    "./validation": { emptyState, validateAdmin, passwordError, isUserId: (id) => /^[0-9a-f-]{36}$/.test(id) },
  });
  return { namespace, calls };
}

test("input boundaries, normalized email and password-free returned state", () => {
  const valid = validateAdmin(input({ name: "  Test Admin  " }));
  assert.equal(valid.values.name, "Test Admin");
  assert.equal(valid.values.email, "admin@example.invalid");
  assert.equal(Object.keys(valid.errors).length, 0);
  assert.equal(JSON.stringify(valid).includes("Test-Password-123!"), false);
  for (const name of ["a", "a".repeat(81)]) assert.ok(validateAdmin(input({ name })).errors.name);
  for (const email of ["invalid", "a b@example.invalid", `${"a".repeat(240)}@example.invalid`]) assert.ok(validateAdmin(input({ email })).errors.email);
  for (const password of ["a".repeat(9), "a".repeat(73), "ADMIN@example.invalid"]) assert.ok(validateAdmin(input({ password })).errors.password);
  for (const password of ["a".repeat(10), "a".repeat(72)]) assert.equal(passwordError(password, "admin@example.invalid"), undefined);
});

test("all actions authorize before examining inputs or using the privileged client", async () => {
  for (const invoke of [
    (m) => m.createAdmin({}, input()),
    (m) => m.setAdminPassword("invalid", {}, input()),
    (m) => m.removeAdmin(new FormData()),
  ]) {
    const { namespace, calls } = await actions({ denied: true });
    await assert.rejects(invoke(namespace), /redirect:\/admin$/);
    assert.deepEqual(calls, [["authorize"]]);
  }
});

test("creation confirms email, fixes role to admin and records creator", async () => {
  const { namespace, calls } = await actions();
  await assert.rejects(namespace.createAdmin({}, input({ role: "super_admin", created_by: existingId })), /notice=created/);
  assert.equal(calls.find(([key]) => key === "create")[1].email_confirm, true);
  assert.deepEqual(calls.find(([key]) => key === "insert")[1], {
    user_id: newId, name: "Test Admin", email: "admin@example.invalid", role: "admin", created_by: ownerId,
  });
});

test("duplicate email is friendly and does not insert or delete an existing user", async () => {
  const { namespace, calls } = await actions({ createError: { code: "email_exists", message: "private detail" } });
  const state = await namespace.createAdmin({}, input());
  assert.match(state.errors.email, /already exists/);
  assert.equal(calls.some(([key]) => key === "insert" || key === "delete"), false);
  assert.equal(JSON.stringify(state).includes("private detail"), false);
});

test("failed or thrown insert deletes only the newly created Auth user", async () => {
  for (const options of [{ insertError: { message: "private detail" } }, { insertThrows: true }]) {
    const { namespace, calls } = await actions(options);
    const state = await namespace.createAdmin({}, input());
    assert.deepEqual(calls.find(([key]) => key === "delete"), ["delete", newId]);
    assert.equal(JSON.stringify(state).includes("private detail"), false);
    assert.equal(JSON.stringify(state).includes("Test-Password-123!"), false);
  }
});

test("rollback failure reports cleanup requirement without leaking details", async () => {
  const { namespace } = await actions({ insertThrows: true, deleteError: { message: "private detail" } });
  const state = await namespace.createAdmin({}, input());
  assert.match(state.message, /cleanup could not complete/);
  assert.equal(JSON.stringify(state).includes("private detail"), false);
});

test("super admin and current account cannot be changed by forged actions", async () => {
  for (const target of [
    { user_id: ownerId, role: "super_admin" },
    { user_id: existingId, role: "super_admin" },
    { user_id: ownerId, role: "admin" },
  ]) {
    const { namespace, calls } = await actions({ target });
    await assert.rejects(namespace.setAdminPassword(target.user_id, {}, input()), /error=protected/);
    await assert.rejects(namespace.removeAdmin(input({ id: target.user_id, confirmation: "remove" })), /error=protected/);
    assert.equal(calls.some(([key]) => key === "client"), false);
  }
});

test("removal requires confirmation, deletes Auth user, and handles errors", async () => {
  const { namespace, calls } = await actions();
  await assert.rejects(namespace.removeAdmin(input({ id: existingId })), /error=confirm/);
  assert.equal(calls.some(([key]) => key === "client"), false);
  await assert.rejects(namespace.removeAdmin(input({ id: existingId, confirmation: "remove" })), /notice=removed/);
  assert.deepEqual(calls.find(([key]) => key === "delete"), ["delete", existingId]);
  const failed = await actions({ deleteError: { message: "private detail" } });
  await assert.rejects(failed.namespace.removeAdmin(input({ id: existingId, confirmation: "remove" })), /error=remove/);
});

test("password change validates against stored email and handles API failure", async () => {
  const { namespace, calls } = await actions();
  const state = await namespace.setAdminPassword(existingId, {}, input({ password: "admin@example.invalid" }));
  assert.ok(state.errors.password);
  assert.equal(calls.some(([key]) => key === "client"), false);
  await assert.rejects(namespace.setAdminPassword(existingId, {}, input()), /notice=password/);
  const failed = await actions({ updateError: { message: "private detail" } });
  const result = await failed.namespace.setAdminPassword(existingId, {}, input());
  assert.equal(JSON.stringify(result).includes("private detail"), false);
  assert.equal(JSON.stringify(result).includes("Test-Password-123!"), false);
});

test("requireSuperAdmin uses getUser and RPC; signed-out and normal admins redirect", async () => {
  for (const scenario of ["signed-out", "admin", "rpc-error", "super-admin"]) {
    const calls = [];
    const auth = await load("../lib/auth.ts", {
      "server-only": {},
      "next/navigation": { redirect },
      "./supabase/server": { createClient: async () => ({
        auth: { getUser: async () => { calls.push("getUser"); return { data: { user: scenario === "signed-out" ? null : { id: ownerId } }, error: null }; } },
        rpc: async (name) => { calls.push(name); return { data: scenario === "super-admin", error: scenario === "rpc-error" ? {} : null }; },
      }) },
    });
    if (scenario === "super-admin") assert.equal((await auth.requireSuperAdmin()).user.id, ownerId);
    else await assert.rejects(auth.requireSuperAdmin(), scenario === "signed-out" ? /redirect:\/login$/ : /redirect:\/admin$/);
    assert.deepEqual(calls, scenario === "signed-out" ? ["getUser"] : ["getUser", "is_super_admin"]);
  }
});
