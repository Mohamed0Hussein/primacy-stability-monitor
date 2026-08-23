// src/views/Dashboard.tsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Boxes, Calendar, FlaskConical } from 'lucide-react';

import { useTheme } from '../hooks/useTheme';
import { Theme } from '../themes/themes';
import { Card } from '../components/common/Card';
import { Specification } from '../constants/specifications';
import { getProducts } from '../utils/api/products';
import { queryKeys } from '../constants/query_keys';
import ROUTE_PATHS from '../constants/route_paths';

interface Product {
  _id: string;
  productName: string;
  specifications?: Specification[];
}

export default function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const { data: products = [] } = useQuery({
    queryKey: [queryKeys.get_products],
    queryFn: async () => {
        const response = await getProducts();
        return response.data;
    },
  });

  const incompleteCount = useMemo(
    () => (Array.isArray(products) ? products.filter((p: Product) => !p.specifications || p.specifications.length === 0).length : 0),
    [products]
  );

  return (
    <div className="min-h-full p-8 pb-32" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.text }}>
            Dashboard
          </h1>
          <p style={{ color: theme.colors.textSecondary }}>
            Manage your stability studies and upcoming tests
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NavCard
            theme={theme}
            icon={<FlaskConical size={24} />}
            iconClass="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500"
            title="Insert Product"
            subtitle="Register a new product batch"
            onClick={() => navigate(ROUTE_PATHS.INSERT_PRODUCT)}
          />

          <NavCard
            theme={theme}
            icon={<Boxes size={24} />}
            iconClass="bg-purple-50 dark:bg-purple-900/20 text-purple-500"
            title="Products Under Testing"
            subtitle={incompleteCount > 0 ? `${incompleteCount} missing specifications` : 'Browse products and batches'}
            onClick={() => navigate(ROUTE_PATHS.PRODUCTS_UNDER_TESTING)}
          />

          <NavCard
            theme={theme}
            icon={<Calendar size={24} />}
            iconClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500"
            title="Withdrawal Schedule"
            subtitle="View this month's withdrawal dates"
            onClick={() => navigate(ROUTE_PATHS.WITHDRAWAL_LIST)}
          />
        </div>

      </div>
    </div>
  );
}

interface NavCardProps {
  theme: Theme;
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}

function NavCard({ theme, icon, iconClass, title, subtitle, onClick }: NavCardProps) {
  return (
    <Card
      className="p-6 cursor-pointer hover:shadow-lg transition-all group"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${iconClass}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg" style={{ color: theme.colors.text }}>{title}</h3>
          <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{subtitle}</p>
        </div>
        <ArrowRight className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
      </div>
    </Card>
  );
}
