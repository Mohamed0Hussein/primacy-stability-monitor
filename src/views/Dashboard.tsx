// src/views/Dashboard.tsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { Calendar, FlaskConical, ArrowRight, Eye } from 'lucide-react';

import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
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
  testsDates?: string[];
  tests?: { condition: string, date: string }[];
  validations?: Record<string, ValidationData>;
}

export default function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const { data: products = [], isLoading } = useQuery({
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
        } else if (sub.testsDates && Array.isArray(sub.testsDates)) {
             upcomingDate = sub.testsDates
                .map((d: string) => moment(d))
                .filter((m: moment.Moment) => m.isSameOrAfter(now))
                .sort((a: moment.Moment, b: moment.Moment) => a.diff(b))[0];
        } else {
            // Fallback for generic 'testsDates' if it was possibly just strings in 'tests' (very unlikely)
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

  const getStatusColor = (date: moment.Moment | undefined) => {
    if (!date) return theme.colors.textSecondary;
    const now = moment().startOf('day');
    const diffDays = date.diff(now, 'days');

    if (diffDays < 0) return theme.colors.error; // Overdue (shouldn't happen with filter above unless logic changes)
    if (diffDays <= 7) return theme.colors.warning; // Due within a week
    return theme.colors.success; // Safe
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <Card className="p-6 cursor-default">
                 <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
                        <Calendar size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg" style={{ color: theme.colors.text }}>Upcoming Tests</h3>
                         <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                            {sortedProducts.filter(s => s.nextTestDate && s.nextTestDate.diff(moment(), 'days') <= 7).length} tests due this week
                         </p>
                    </div>
                </div>
            </Card>
        </div>

        {/* Withdrawal Dates List */}
        <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text }}>
                Upcoming Withdrawal Dates
            </h2>
            
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-12" style={{ color: theme.colors.textSecondary }}>Loading...</div>
                ) : sortedProducts.length === 0 ? (
                    <Card className="p-8 text-center flex flex-col items-center justify-center gap-3">
                        <FlaskConical size={48} className="text-gray-300 dark:text-gray-600" />
                        <p style={{ color: theme.colors.textSecondary }}>No upcoming tests found.</p>
                        <Button variant="ghost" onClick={() => navigate(ROUTE_PATHS.INSERT_PRODUCT)}>Get Started</Button>
                    </Card>
                ) : (
                    sortedProducts.map((sub) => (
                        <Card key={sub._id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div 
                                        className="w-1.5 self-stretch rounded-full"
                                        style={{ backgroundColor: getStatusColor(sub.nextTestDate) }} 
                                    />
                                    <div>
                                        <h3 className="font-semibold" style={{ color: theme.colors.text }}>{sub.productName}</h3>
                                        <div className="flex gap-4 text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                                            <span>Batch: {sub.batchNumber}</span>
                                            {/* Could add info about dosage form etc if needed */}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
                                    <div className="text-right flex-1 md:flex-auto">
                                        <p className="text-xs uppercase font-bold tracking-wider" style={{ color: theme.colors.textSecondary }}>Next Test</p>
                                        <p className="font-medium" style={{ color: getStatusColor(sub.nextTestDate) }}>
                                            {sub.formattedNextDate}
                                        </p>
                                    </div>
                                    <Button 
                                        variant="ghost"
                                        onClick={() => navigate(`/product/${sub._id}/tests`)}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Eye size={16} />
                                        View Tests
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
