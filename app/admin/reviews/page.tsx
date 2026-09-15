"use client";
// app/admin/reviews/page.tsx
import { useEffect, useState } from "react";
import {
  Star,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  Image as ImageIcon,
  Reply,
  ShieldCheck,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import AlertModal from "@/components/ui/AlertModal";

export default function AdminReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("all");

  const [replyModal, setReplyModal] = useState(false);
  const [activeReview, setActiveReview] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  const [alert, setAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (reviewId: number, currentApproved: boolean) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOGGLE_APPROVAL",
          reviewId,
          isApproved: !currentApproved,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReview) return;

    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADMIN_REPLY",
          reviewId: activeReview.id,
          adminReply: replyText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlert({
          isOpen: true,
          title: "Reply Saved",
          message: "Official brand reply posted to customer review!",
          type: "success",
        });
        setReplyModal(false);
        setReplyText("");
        fetchReviews();
      }
    } catch (err: any) {
      setAlert({ isOpen: true, title: "Error", message: err.message, type: "error" });
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Delete this customer review permanently?")) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      r.userName?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q) ||
      r.product?.name?.toLowerCase().includes(q);

    const matchRating = filterRating === "all" || String(r.rating) === filterRating;
    return matchSearch && matchRating;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper p-6 rounded-3xl border border-line shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-forest text-xs font-bold uppercase tracking-wider mb-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Social Proof & Trust</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-ink">
            Customer Photo Reviews & Q&A
          </h2>
          <p className="text-xs text-ink-soft mt-0.5 max-w-2xl leading-relaxed">
            Moderate customer star ratings, view unboxed product photos, reply officially, and manage storefront testimonials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-white border border-stone-200 text-stone-800 flex items-center gap-2 text-xs font-bold">
            <MessageSquare className="w-4 h-4 text-forest" />
            <span>{reviews.length} Total Reviews</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-line">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-600">Filter by Rating:</span>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:bg-white"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Star)</option>
            <option value="4">⭐⭐⭐⭐ (4 Star)</option>
            <option value="3">⭐⭐⭐ (3 Star)</option>
            <option value="2">⭐⭐ (2 Star)</option>
            <option value="1">⭐ (1 Star)</option>
          </select>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search reviews, products, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-stone-400 bg-white rounded-3xl border border-line">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-forest" />
            Loading customer reviews...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-stone-400 bg-white rounded-3xl border border-line">
            No reviews found matching your criteria.
          </div>
        ) : (
          filteredReviews.map((r) => {
            const photos = Array.isArray(r.photos) ? r.photos : [];
            return (
              <div
                key={r.id}
                className="bg-white p-5 rounded-3xl border border-line shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-forest/10 text-forest font-bold flex items-center justify-center text-sm uppercase">
                      {r.userName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-ink">{r.userName}</h4>
                        {r.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400">
                        Reviewed product: <strong className="text-stone-700">{r.product?.name || "Product"}</strong> • {new Date(r.createdAt).toLocaleDateString("bn-BD")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < r.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => handleToggleApproval(r.id, r.isApproved)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        r.isApproved
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                      }`}
                    >
                      {r.isApproved ? "Approved" : "Hidden"}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-stone-800 leading-relaxed font-medium">
                  "{r.comment}"
                </p>

                {/* Uploaded Customer Photos */}
                {photos.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    {photos.map((img: string, idx: number) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="w-16 h-16 rounded-xl overflow-hidden border border-stone-200 hover:opacity-90 transition-opacity"
                      >
                        <img src={img} alt="Customer review photo" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Admin Official Reply */}
                {r.adminReply && (
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                    <p className="text-[11px] font-bold text-forest flex items-center gap-1">
                      <Reply className="w-3 h-3 rotate-180" />
                      <span>ENMAR Official Response:</span>
                    </p>
                    <p className="text-xs text-stone-700">{r.adminReply}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <button
                    onClick={() => {
                      setActiveReview(r);
                      setReplyText(r.adminReply || "");
                      setReplyModal(true);
                    }}
                    className="text-forest hover:text-forest-deep font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>{r.adminReply ? "Edit Brand Reply" : "Reply as Store Owner"}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteReview(r.id)}
                    className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Modal */}
      {replyModal && activeReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-line shadow-2xl">
            <h3 className="text-base font-bold text-ink">
              Official Reply to {activeReview.userName}'s Review
            </h3>
            <p className="text-xs text-stone-500 line-clamp-2">
              Review: "{activeReview.comment}"
            </p>

            <form onSubmit={handleSaveReply} className="space-y-3">
              <textarea
                rows={4}
                placeholder="Write your official brand thank you or resolution message..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white"
                required
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyModal(false)}
                  className="flex-1 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold"
                >
                  Post Official Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}
