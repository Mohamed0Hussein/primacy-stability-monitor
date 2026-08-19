// src/views/Dashboard.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { AlertTriangle, Eye, FlaskConical, Plus } from 'lucide-react';

import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ProductDetailModal } from '../components/products/ProductDetailModal';
import { WithdrawalTable } from '../components/withdrawal/WithdrawalTable';
import { formatConditionsList } from '../constants/stability_conditions';
import { Specification } from '../constants/specifications';
import { getProducts } from '../utils/api/products';
import { queryKeys } from '../constants/query_keys';
import ROUTE_PATHS from '../constants/route_paths';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Product {
  _id: string;
  productName: string;
  batchNumber: string;
  conditions?: string[];
  specifications?: Specification[];
  testsResults?: { createdAt?: string }[];
}

export default function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: [queryKeys.get_products],
    queryFn: async () => {
        const response = await getProducts();
        return response.data;
    },
  });

  const sortedProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return [...products].sort((a: Product, b: Product) => a.productName.localeCompare(b.productName));
  }, [products]);

  const incompleteProducts = useMemo(
    () => sortedProducts.filter((p: Product) => !p.specifications || p.specifications.length === 0),
    [sortedProducts]
  );

  const selectedProduct = useMemo(
    () => sortedProducts.find((p: Product) => p._id === selectedId) || null,
    [sortedProducts, selectedId]
  );

  const lastResultLabel = (product: Product) => {
    const dates = (product.testsResults || [])
      .map(r => r.createdAt)
      .filter((d): d is string => !!d)
      .sort();
    const latest = dates[dates.length - 1];
    return latest ? `Last submitted ${moment(latest).format('MMM DD, YYYY')}` : 'No results submitted yet';
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
          <Button variant="primary" onClick={() => navigate(ROUTE_PATHS.INSERT_PRODUCT)} className="flex items-center gap-2">
            <Plus size={16} />
            Insert New Product
          </Button>
        </div>

        {/* Incomplete Products */}
        {incompleteProducts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: theme.colors.warning }}>
              <AlertTriangle size={18} />
              Incomplete Products
              <span
                className="text-sm font-normal px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${theme.colors.warning}20`, color: theme.colors.warning }}
              >
                {incompleteProducts.length}
              </span>
            </h2>
            <div className="space-y-2">
              {incompleteProducts.map((product: Product) => (
                <Card
                  key={product._id}
                  className="p-3 flex items-center justify-between gap-4"
                  style={{ borderColor: theme.colors.warning }}
                >
                  <div>
                    <span className="font-medium" style={{ color: theme.colors.text }}>{product.productName}</span>
                    <span className="text-sm ml-2" style={{ color: theme.colors.textSecondary }}>
                      Batch: {product.batchNumber} · no specifications yet
                    </span>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedId(product._id)}>
                    Complete
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Products Under Testing */}
        <div>
          <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text }}>
            Products Under Testing
          </h2>

          <div className="space-y-3">
            {isLoading ? (
              <LoadingSpinner fullScreen={false} size="md" loadingLabel="Loading products..." />
            ) : sortedProducts.length === 0 ? (
              <Card className="p-8 text-center flex flex-col items-center justify-center gap-3">
                <FlaskConical size={48} className="text-gray-300 dark:text-gray-600" />
                <p style={{ color: theme.colors.textSecondary }}>No products found.</p>
                <Button variant="ghost" onClick={() => navigate(ROUTE_PATHS.INSERT_PRODUCT)}>Insert a product</Button>
              </Card>
            ) : (
              sortedProducts.map((product: Product) => (
                <Card
                  key={product._id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedId(product._id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div
                        className="p-2.5 rounded-lg"
                        style={{ backgroundColor: `${theme.colors.primary}20`, color: theme.colors.primary }}
                      >
                        <FlaskConical size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold" style={{ color: theme.colors.text }}>{product.productName}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                          <span>Batch: {product.batchNumber}</span>
                          <span>{formatConditionsList(product.conditions)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 md:flex-row-reverse md:pl-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
                      <Button variant="ghost" className="flex items-center gap-2">
                        <Eye size={16} />
                        View details
                      </Button>
                      <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
                        {lastResultLabel(product)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Monthly Withdrawal List */}
        <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text }}>
                Monthly Withdrawal List
            </h2>
            <WithdrawalTable />
        </div>

      </div>

      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedId(null)} />
    </div>
  );
}
