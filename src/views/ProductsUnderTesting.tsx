// src/views/ProductsUnderTesting.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { AlertTriangle, Eye, FlaskConical, Plus } from 'lucide-react';

import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ProductDetailModal } from '../components/products/ProductDetailModal';
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
  stabilityDate?: string;
  expiryDate?: string;
}

export default function ProductsUnderTesting() {
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

  const productGroups = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const product of sortedProducts) {
      const batches = map.get(product.productName) || [];
      batches.push(product);
      map.set(product.productName, batches);
    }
    return Array.from(map.values());
  }, [sortedProducts]);

  const formatDate = (date: string | undefined) => (date ? moment(date).format('DD/MM/YYYY') : '—');

  return (
    <div className="min-h-full p-8 pb-32" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.text }}>
              Products Under Testing
            </h1>
            <p style={{ color: theme.colors.textSecondary }}>
              All registered batches and their stability schedule
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

        {/* Products table */}
        {isLoading ? (
          <LoadingSpinner fullScreen={false} size="md" loadingLabel="Loading products..." />
        ) : sortedProducts.length === 0 ? (
          <Card className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <FlaskConical size={48} className="text-gray-300 dark:text-gray-600" />
            <p style={{ color: theme.colors.textSecondary }}>No products found.</p>
            <Button variant="ghost" onClick={() => navigate(ROUTE_PATHS.INSERT_PRODUCT)}>Insert a product</Button>
          </Card>
        ) : (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: 780 }}>
                <thead>
                  <tr style={{ backgroundColor: theme.colors.surfaceVariant }}>
                    {['Product name', 'Batch #', 'Conditions', 'Stability start', 'Stability end', ''].map(h => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-semibold whitespace-nowrap"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productGroups.map((batches) => (
                    <tr
                      key={batches[0].productName}
                      className="border-t"
                      style={{ borderColor: theme.colors.border }}
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap align-top" style={{ color: theme.colors.text }}>
                        {batches[0].productName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap align-top" style={{ color: theme.colors.textSecondary }}>
                        <div className="flex flex-col gap-1">
                          {batches.map(b => (
                            <button
                              key={b._id}
                              onClick={() => setSelectedId(b._id)}
                              className="underline decoration-dotted underline-offset-2 hover:opacity-75 cursor-pointer text-left"
                            >
                              {b.batchNumber}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap align-top" style={{ color: theme.colors.textSecondary }}>
                        <div className="flex flex-col gap-1">
                          {batches.map(b => (
                            <span key={b._id}>{formatConditionsList(b.conditions)}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap align-top" style={{ color: theme.colors.textSecondary }}>
                        <div className="flex flex-col gap-1">
                          {batches.map(b => (
                            <span key={b._id}>{formatDate(b.stabilityDate)}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap align-top" style={{ color: theme.colors.textSecondary }}>
                        <div className="flex flex-col gap-1">
                          {batches.map(b => (
                            <span key={b._id}>{formatDate(b.expiryDate)}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap align-top">
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedId(batches[0]._id)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Eye size={16} />
                          View product
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

      </div>

      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedId(null)} />
    </div>
  );
}
