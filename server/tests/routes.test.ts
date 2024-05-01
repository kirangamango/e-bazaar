import { UserFunction } from "../functions";

test("get all should return 200 status response", async () => {
  const data = await UserFunction.getAll({});
  expect(data).toBeTruthy();
});
