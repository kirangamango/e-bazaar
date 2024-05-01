import { UserFunction } from "../functions";

test("get all should return 200 status response", async () => {
  console.log("inside test-------------------------------->");
  const data = await UserFunction.getAll({});
  console.log({ userData: data.users[0] });
  expect(data).toBeTruthy();
});
