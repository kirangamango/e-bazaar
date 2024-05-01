import { Cashfree } from "cashfree-pg";
import { configs } from ".";

Cashfree.XClientId = configs.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = configs.CASHFREE_ACCESS_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

export { Cashfree };
