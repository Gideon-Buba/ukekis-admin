import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchProducts, fetchServices, fetchProductReviews, fetchServiceReviews,
  deleteProduct, deleteService, deleteReview,
  type Product, type Service, type Review,
} from "@/api/content";
import { Topbar } from "@/components/Topbar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Trash2, ImageOff, Star, ChevronDown } from "lucide-react";

/* ── Products Tab ───────────────────────────────────────────── */
function ProductsTab() {
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", cursor],
    queryFn: () => fetchProducts(cursor),
    placeholderData: (prev) => prev,
  });

  // Accumulate pages
  if (data && !allProducts.find((p) => p.id === data.data[0]?.id)) {
    setAllProducts((prev) => [...prev, ...data.data]);
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (_, id) => {
      setAllProducts((prev) => prev.filter((p) => p.id !== id));
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const mainImage = (p: Product) => p.images?.find((i) => i.isMain)?.url ?? p.images?.[0]?.url;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Product</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Price</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rating</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Reviews</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && allProducts.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-6 py-3"><Skeleton className="h-10 w-full" /></td></tr>
                ))
              : allProducts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {mainImage(p) ? (
                          <img src={mainImage(p)} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <ImageOff className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-400 max-w-xs truncate">{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-gray-900">{formatCurrency(p.price)}</td>
                    <td className="px-3 py-3 text-center">
                      {p.averageRating != null ? (
                        <span className="flex items-center justify-center gap-1 text-xs text-yellow-600">
                          <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
                          {p.averageRating.toFixed(1)}
                        </span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">{p.totalReviews}</td>
                    <td className="px-6 py-3 text-right">
                      <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(p)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
            {!isLoading && allProducts.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.pagination.hasNextPage && (
        <div className="px-6 py-4 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={() => setCursor(data.pagination.nextCursor ?? undefined)}>
            <ChevronDown className="h-4 w-4 mr-1" /> Load More
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Product"
        description={`Permanently delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </>
  );
}

/* ── Services Tab ───────────────────────────────────────────── */
function ServicesTab() {
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["services", cursor],
    queryFn: () => fetchServices(cursor),
    placeholderData: (prev) => prev,
  });

  if (data && !allServices.find((s) => s.id === data.data[0]?.id)) {
    setAllServices((prev) => [...prev, ...data.data]);
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: (_, id) => {
      setAllServices((prev) => prev.filter((s) => s.id !== id));
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete service"),
  });

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Service</th>
              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Business</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Price</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rating</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && allServices.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-3"><Skeleton className="h-10 w-full" /></td></tr>
                ))
              : allServices.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900">{s.title}</div>
                      <div className="text-xs text-gray-400 max-w-xs truncate">{s.description}</div>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{s.businessOwner?.businessName ?? "—"}</td>
                    <td className="px-3 py-3 text-right font-medium text-gray-900">{formatCurrency(s.price)}</td>
                    <td className="px-3 py-3 text-center text-gray-600 text-xs">{s.duration} min</td>
                    <td className="px-3 py-3 text-center">
                      {s.averageRating != null ? (
                        <span className="flex items-center justify-center gap-1 text-xs text-yellow-600">
                          <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
                          {s.averageRating.toFixed(1)}
                        </span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(s)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
            {!isLoading && allServices.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No services found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.pagination.hasNextPage && (
        <div className="px-6 py-4 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={() => setCursor(data.pagination.nextCursor ?? undefined)}>
            <ChevronDown className="h-4 w-4 mr-1" /> Load More
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Service"
        description={`Permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </>
  );
}

/* ── Reviews Tab ───────────────────────────────────────────── */
function ReviewsList({ reviews, onDelete }: { reviews: Review[]; onDelete: (r: Review) => void }) {
  if (!reviews.length) {
    return <div className="px-6 py-10 text-center text-gray-400 text-sm">No reviews for this item</div>;
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Client ID</th>
          <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Comment</th>
          <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rating</th>
          <th className="text-right px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
          <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
        </tr>
      </thead>
      <tbody>
        {reviews.map((r) => (
          <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
            <td className="px-6 py-3 font-mono text-xs text-gray-500">{r.clientId.slice(0, 8)}…</td>
            <td className="px-3 py-3 text-gray-600 max-w-xs truncate">{r.comment}</td>
            <td className="px-3 py-3 text-center">
              <span className="flex items-center justify-center gap-0.5 text-yellow-500 text-xs">
                {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
              </span>
            </td>
            <td className="px-3 py-3 text-right text-gray-500 text-xs">{formatDate(r.createdAt)}</td>
            <td className="px-6 py-3 text-right">
              <Button size="sm" variant="destructive" onClick={() => onDelete(r)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReviewsTab() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"product" | "service">("product");
  const [selectedId, setSelectedId] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const { data: productsResp } = useQuery({
    queryKey: ["products", undefined],
    queryFn: () => fetchProducts(undefined, 100),
  });
  const { data: servicesResp } = useQuery({
    queryKey: ["services", undefined],
    queryFn: () => fetchServices(undefined, 100),
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", mode, selectedId],
    queryFn: () =>
      mode === "product" ? fetchProductReviews(selectedId) : fetchServiceReviews(selectedId),
    enabled: !!selectedId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", mode, selectedId] });
      toast.success("Review deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete review"),
  });

  const productItems = productsResp?.data ?? [];
  const serviceItems = servicesResp?.data ?? [];
  const items = mode === "product" ? productItems : serviceItems;

  return (
    <>
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
        <div className="flex rounded-md border border-gray-200 overflow-hidden text-sm">
          <button
            className={`px-4 py-1.5 font-medium transition-colors ${mode === "product" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            onClick={() => { setMode("product"); setSelectedId(""); }}
          >
            Product Reviews
          </button>
          <button
            className={`px-4 py-1.5 font-medium transition-colors ${mode === "service" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            onClick={() => { setMode("service"); setSelectedId(""); }}
          >
            Service Reviews
          </button>
        </div>

        <select
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-600 min-w-[220px]"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">— Select a {mode} —</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {"name" in item ? item.name : (item as Service).title}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        {!selectedId ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            Select a {mode} above to view its reviews
          </div>
        ) : reviewsLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <ReviewsList reviews={reviews} onDelete={setDeleteTarget} />
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Review"
        description="Permanently delete this review? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function ModerationPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Content Moderation" />
      <main className="flex-1 p-6 lg:p-8">
        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card><CardContent className="p-0"><ProductsTab /></CardContent></Card>
          </TabsContent>
          <TabsContent value="services">
            <Card><CardContent className="p-0"><ServicesTab /></CardContent></Card>
          </TabsContent>
          <TabsContent value="reviews">
            <Card><CardContent className="p-0"><ReviewsTab /></CardContent></Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
