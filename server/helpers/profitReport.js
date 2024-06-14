const profitReport = (transactions) => {
  return transactions.reduce(
    (acc, { _id, total, type }) => {
      if (type === "income") {
        acc.profit += total;
        acc.totalIncome += total;
      } else if (type === "outcome") {
        acc.profit -= total;
        acc.totalOutcome += total;
      }
      acc.transactionIds.push(_id);
      return acc;
    },
    { profit: 0, totalIncome: 0, totalOutcome: 0, transactionIds: [] }
  );
};

module.exports = profitReport;
