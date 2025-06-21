import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { coinsAPI, withdrawalsAPI, TransactionsResponse, HistoryResponse } from '../services/api';

const Wallet = () => {
  const { coinBalance } = useStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const txRes = await coinsAPI.getTransactions();
        setTransactions(txRes.data.transactions || []);
        const wdRes = await withdrawalsAPI.getHistory();
        setWithdrawals(wdRes.data.history || []);
      } catch (e) {
        setTransactions([]);
        setWithdrawals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="py-4">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-[#ffd700] mb-2">Your Wallet</h2>
        <p className="text-3xl font-bold">{coinBalance} coins</p>
        <p className="text-sm text-gray-400 mt-1">Available for withdrawal</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-center">Withdrawals</h3>
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : withdrawals.length === 0 ? (
          <p className="text-center text-gray-400">No withdrawals yet.</p>
        ) : (
          <div className="space-y-2">
            {withdrawals.map((wd, idx) => (
              <div key={idx} className="card p-3 flex justify-between items-center">
                <div>
                  <p className="font-bold">Withdrawal</p>
                  <p className="text-sm text-gray-400">{wd.date || wd.createdAt || ''}</p>
                </div>
                <p className="text-[#ffd700]">-{wd.amount} coins</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-center mb-4">Transaction History</h3>
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-400">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx, idx) => (
              <div key={idx} className="card p-3 flex justify-between items-center">
                <div>
                  <p className="font-bold">{tx.type || 'Transaction'}</p>
                  <p className="text-sm text-gray-400">{tx.date || tx.createdAt || ''}</p>
                </div>
                <p className="text-[#ffd700]">{tx.amount > 0 ? '+' : ''}{tx.amount} coins</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet; 