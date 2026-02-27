type TransactionType = 'income' | 'expense';

interface FundsExpendituresRecord {
    id: number;
    reportYear: number;
    type: TransactionType;
    category: string;
    amountUAH: number;
    amountUSD: number;
}

interface FundsExpendituresTableProps {
    records: FundsExpendituresRecord[];
    // isEditing: boolean;
    // onEditRecord: (recordId: number) => void;
    // onDeleteRecord: (recordId: number) => void;
}

export const FundsExpendituresTable = ({ records }: FundsExpendituresTableProps) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>
                        <input type="checkbox" />
                        Звітній рік
                    </th>
                    <th>Тип</th>
                    <th>Категорія</th>
                    <th>Сума UA</th>
                    <th>Сума USD</th>
                </tr>
            </thead>
            <tbody>
                {records.map((record) => (
                    <tr key={record.id}>
                        <td>
                            <input type="checkbox" />
                            {record.reportYear}
                        </td>
                        <td>{record.type}</td>
                        <td>{record.category}</td>
                        <td>{record.amountUAH}</td>
                        <td>{record.amountUSD}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
