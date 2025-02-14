// ignitions/modules/PaymentModule.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PaymentModule = buildModule("PaymentModule", (m) => {
  const payments = m.contract("AppPayments");

  return { payments };
});

export default PaymentModule;
