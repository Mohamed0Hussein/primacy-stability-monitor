// src/views/Dashboard.tsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { Calendar, FlaskConical, ArrowRight, Boxes } from 'lucide-react';

import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/common/Card';
import { WithdrawalTable } from '../components/withdrawal/WithdrawalTable';
import { getProducts } from '../utils/api/products';
import { queryKeys } from '../constants/query_keys';
import ROUTE_PATHS from '../constants/route_paths';

interface ValidationData {
    status: 'pending' | 'completed' | 'overdue';
    date: string;
}

interface Product {
  _id: string;
  productName: string;
  batchNumber: string;
  tests?: { condition: string, date: string }[];
  validations?: Record<string, ValidationData>;
}

export default function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const { data: products = [] } = useQuery({
    queryKey: [queryKeys.get_products], // Using generic key for substances list for now
    queryFn: async () => {
        const response = await getProducts();
        return response.data;
    },
  });

  const sortedProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    const now = moment().startOf('day');

    return [...products].map((sub: Product) => { // Added type hint
        let upcomingDate: moment.Moment | undefined;
        let upcomingCondition: string | undefined;

        if (sub.tests && Array.isArray(sub.tests) && sub.tests.length > 0) {
             const upcomingTest = sub.tests
                .map(t => ({ ...t, m: moment(t.date) }))
                .filter(t => t.m.isSameOrAfter(now))
                .sort((a, b) => a.m.diff(b.m))[0];
             
             if (upcomingTest) {
                upcomingDate = upcomingTest.m;
                upcomingCondition = upcomingTest.condition;
             }
        }
        
        const dateStr = upcomingDate ? upcomingDate.format('MMM DD, YYYY') : 'No upcoming tests';
        const displayStr = upcomingCondition ? `${dateStr} (${upcomingCondition})` : dateStr;

        return {
            ...sub,
            nextTestDate: upcomingDate,
            formattedNextDate: displayStr
        };
    }).sort((a, b) => {
        if (!a.nextTestDate && !b.nextTestDate) return 0;
        if (!a.nextTestDate) return 1;
        if (!b.nextTestDate) return -1;
        return a.nextTestDate.diff(b.nextTestDate);
    });
  }, [products]);

  return (
    <div className="min-h-full p-8 pb-32" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.text }}>
              Dashboard
            </h1>
            <p style={{ color: theme.colors.textSecondary }}>
              Manage your stability studies and upcoming tests
            </p>
          </div>
        </div>

        {/* Quick Stats / Navigation Cards - Optional but nice for "buttons to take user..." request */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
                className="p-6 cursor-pointer hover:shadow-lg transition-all group"
                onClick={() => navigate(ROUTE_PATHS.INSERT_PRODUCT)}
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500">
                        <FlaskConical size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg" style={{ color: theme.colors.text }}>Insert Product</h3>
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Register a new product batch</p>
                    </div>
                    <ArrowRight className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </div>
            </Card>

            <Card
                className="p-6 cursor-pointer hover:shadow-lg transition-all group"
                onClick={() => navigate(ROUTE_PATHS.PRODUCTS)}
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-500">
                        <Boxes size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg" style={{ color: theme.colors.text }}>View Products</h3>
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Browse products and their IDs</p>
                    </div>
                    <ArrowRight className="text-gray-300 group-hover:text-purple-500 transition-colors" />
                </div>
            </Card>

            <Card
                className="p-6 cursor-pointer hover:shadow-lg transition-all group"
                onClick={() => navigate(ROUTE_PATHS.WITHDRAWAL_LIST)}
            >
                 <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
                        <Calendar size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg" style={{ color: theme.colors.text }}>Withdrawal Schedule</h3>
                         <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                            {sortedProducts.filter(s => s.nextTestDate && s.nextTestDate.diff(moment(), 'days') <= 7).length} tests due this week
                         </p>
                    </div>
                    <ArrowRight className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </div>
            </Card>
        </div>

        {/* Monthly Withdrawal List */}
        <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text }}>
                Monthly Withdrawal List
            </h2>
            <WithdrawalTable />
        </div>

      </div>
    </div>
  );
}
