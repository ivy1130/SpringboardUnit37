const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("works: data provided", function () {
    const result = sqlForPartialUpdate({firstName: 'Aliya', age: 32}, {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    })

    expect(result).toEqual({
      setCols: `"first_name"=$1, "age"=$2`,
      values: ["Aliya", 32]
    })
  })

  test("works: no data provided", function () {
    try {
      const result = sqlForPartialUpdate({}, {})
    } catch (e) {
      expect(e instanceof BadRequestError).toBeTruthy()
    }
  })
})