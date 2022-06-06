"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 10000,
    equity: 0,
    companyHandle: "c1"
  };

  test("works", async function () {
    let job = await Job.create(newJob);

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle as "companyHandle"
           FROM jobs
           WHERE id = '${job.id}'`);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "new",
        salary: 10000,
        equity: "0",
        companyHandle: "c1"
      },
    ]);
  });

});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "j1",
        salary: 100,
        equity: "0",
        companyHandle: "c1"
      },
      {
        id: testJobIds[1],
        title: "j2",
        salary: 200,
        equity: "0.1",
        companyHandle: "c2"
      },
      {
        id: testJobIds[2],
        title: "j3",
        salary: 300,
        equity: "0.9",
        companyHandle: "c3"
      },
    ]);
  });

  test("works: by min salary", async function () {
    let jobs = await Job.findAll({ minSalary: 200 });
    expect(jobs).toEqual([
      {
        id: testJobIds[1],
        title: "j2",
        salary: 200,
        equity: "0.1",
        companyHandle: "c2"
      },
      {
        id: testJobIds[2],
        title: "j3",
        salary: 300,
        equity: "0.9",
        companyHandle: "c3"
      }
    ]);
  });

  test("works: by hasEquity", async function () {
    let jobs = await Job.findAll({ hasEquity: "true" });
    expect(jobs).toEqual([
      {
        id: testJobIds[1],
        title: "j2",
        salary: 200,
        equity: "0.1",
        companyHandle: "c2"
      },
      {
        id: testJobIds[2],
        title: "j3",
        salary: 300,
        equity: "0.9",
        companyHandle: "c3"
      }
    ]);
  });

  test("works: by minSalary and hasEquity", async function () {
    let jobs = await Job.findAll({ minSalary: 300, hasEquity: "true" });
    expect(jobs).toEqual([
      {
        id: testJobIds[2],
        title: "j3",
        salary: 300,
        equity: "0.9",
        companyHandle: "c3"
      }
    ]);
  });

  test("works: by title", async function () {
    let jobs = await Job.findAll({ title: "j1" });
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "j1",
        salary: 100,
        equity: "0",
        companyHandle: "c1"
      }
    ]);
  });

  test("works: empty list on nothing found", async function () {
    let jobs = await Job.findAll({ title: "invalid" });
    expect(jobs).toEqual([]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(testJobIds[0]);
    expect(job).toEqual({
      id: testJobIds[0],
      title: "j1",
      salary: 100,
      equity: "0",
      companyHandle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    salary: 500
  };

  test("works", async function () {
    let job = await Job.update(testJobIds[0], updateData);
    expect(job).toEqual({
      id: testJobIds[0],
      title: "j1",
      salary: 500,
      equity: "0",
      companyHandle: "c1"
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle as "companyHandle"
            FROM jobs
            WHERE id = ${testJobIds[0]}`);
    expect(result.rows).toEqual([{
      id: testJobIds[0],
      title: "j1",
      salary: 500,
      equity: "0",
      companyHandle: "c1"
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "j1",
      salary: null,
      equity: null,
    };

    let job = await Job.update(testJobIds[0], updateDataSetNulls);
    expect(job).toEqual({
      id: testJobIds[0],
      title: "j1",
      salary: null,
      equity: null,
      companyHandle: "c1"
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle as "companyHandle"
            FROM jobs
            WHERE id = ${testJobIds[0]}`);
    expect(result.rows).toEqual([{
      id: testJobIds[0],
      title: "j1",
      salary: null,
      equity: null,
      companyHandle: "c1"
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(testJobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(testJobIds[0]);
    const res = await db.query(
        `SELECT id FROM jobs WHERE id=${testJobIds[0]}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
