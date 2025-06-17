"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalForm = void 0;
const react_1 = require("react");
const withdrawals_1 = require("../store/withdrawals");
const coins_1 = require("../store/coins");
const WithdrawalForm = () => {
    const { create, isLoading, error } = (0, withdrawals_1.useWithdrawalsStore)();
    const { balance } = (0, coins_1.useCoinsStore)();
    const [amount, setAmount] = (0, react_1.useState)('');
    const [upiId, setUpiId] = (0, react_1.useState)('');
    const handleSubmit = (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        if (!amount || !upiId || !balance)
            return;
        const amountNum = parseInt(amount);
        if (amountNum < 1000 || amountNum > balance.coinBalance) {
            return;
        }
        yield create(amountNum, upiId);
        setAmount('');
        setUpiId('');
    });
    return (<form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount (min: 1000 coins)
        </label>
        <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} min="1000" max={(balance === null || balance === void 0 ? void 0 : balance.coinBalance) || 0} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required/>
      </div>

      <div>
        <label htmlFor="upiId" className="block text-sm font-medium text-gray-700">
          UPI ID
        </label>
        <input type="text" id="upiId" value={upiId} onChange={(e) => setUpiId(e.target.value)} pattern="^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required/>
      </div>

      {error && (<div className="text-red-600 text-sm">
          {error}
        </div>)}

      <button type="submit" disabled={isLoading || !amount || !upiId} className={`
          w-full py-2 px-4 rounded-md text-white font-medium
          ${isLoading || !amount || !upiId
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'}
        `}>
        {isLoading ? 'Processing...' : 'Withdraw'}
      </button>

      {balance && (<p className="text-sm text-gray-500">
          Available balance: {balance.coinBalance} coins
        </p>)}
    </form>);
};
exports.WithdrawalForm = WithdrawalForm;
