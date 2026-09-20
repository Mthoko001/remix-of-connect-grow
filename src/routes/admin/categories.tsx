import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CornerDownRight, Loader2, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { useAdminSession } from "@/hooks/use-admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader, Panel } from "@/components/supplier/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildCategoryTree,
  createCategory,
  deleteCategory,
  fetchAllCategories,
  updateCategory,
  type CategoryNode,
  type CategoryRow,
} from "@/lib/categories";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [{ title: "Categories — LeadLink Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: CategoriesPage,
});

const NO_PARENT = "none";

function CategoriesPage() {
  const { email, checking } = useAdminSession();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>(NO_PARENT);
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<CategoryRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  async function loadCategories() {
    setLoading(true);
    try {
      setCategories(await fetchAllCategories());
    } catch {
      toast.error("Couldn't load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!checking) void loadCategories();
  }, [checking]);

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);

  // A category can't be its own parent, and (to keep this simple, matching
  // a two-level menu like the reference site) a child category can't itself
  // be picked as someone else's parent.
  const parentOptions = useMemo(
    () =>
      categories.filter(
        (c) => c.parent_category_id === null && c.category_id !== editing?.category_id,
      ),
    [categories, editing],
  );

  function openCreate(defaultParentId: number | null = null) {
    setEditing(null);
    setName("");
    setParentId(defaultParentId ? String(defaultParentId) : NO_PARENT);
    setFormOpen(true);
  }

  function openEdit(category: CategoryRow) {
    setEditing(category);
    setName(category.name);
    setParentId(category.parent_category_id ? String(category.parent_category_id) : NO_PARENT);
    setFormOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Enter a category name.");
      return;
    }
    setSaving(true);
    try {
      const resolvedParentId = parentId === NO_PARENT ? null : Number(parentId);
      if (editing) {
        await updateCategory(editing.category_id, name, resolvedParentId);
        toast.success("Category updated.");
      } else {
        await createCategory(name, resolvedParentId);
        toast.success("Category created.");
      }
      setFormOpen(false);
      await loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save this category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    setDeleteError(null);
    try {
      await deleteCategory(deleting.category_id);
      toast.success("Category deleted.");
      setDeleting(null);
      await loadCategories();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Couldn't delete this category.");
    } finally {
      setDeletingBusy(false);
    }
  }

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <AdminShell email={email}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Categories"
          subtitle="Manage the categories shown in the site's Categories menu and used on supplier profiles."
        />
        <Button onClick={() => openCreate()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Panel>
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading categories…</p>
        ) : tree.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Tags className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">No categories yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first category to start building the Categories menu.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {tree.map((node) => (
              <CategoryTreeItem
                key={node.category_id}
                node={node}
                onEdit={openEdit}
                onDelete={setDeleting}
                onAddChild={openCreate}
              />
            ))}
          </ul>
        )}
      </Panel>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this category's name or parent."
                : "Create a new top-level category, or a subcategory under an existing one."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat_name">Name</Label>
              <Input
                id="cat_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Roofing"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Parent category</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PARENT}>None (top-level category)</SelectItem>
                  {parentOptions.map((p) => (
                    <SelectItem key={p.category_id} value={String(p.category_id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving} className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleting?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. Deletion is blocked if any subcategories or supplier profiles
              still use this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()} disabled={deletingBusy}>
              {deletingBusy ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

function CategoryTreeItem({
  node,
  onEdit,
  onDelete,
  onAddChild,
}: {
  node: CategoryNode;
  onEdit: (c: CategoryRow) => void;
  onDelete: (c: CategoryRow) => void;
  onAddChild: (parentId: number) => void;
}) {
  return (
    <li>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-medium text-foreground">{node.name}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddChild(node.category_id)}
            className="gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Subcategory
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(node)} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(node)} aria-label="Delete">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      {node.children.length > 0 && (
        <ul className="divide-y divide-border/60 border-t border-border/60 bg-muted/20 pl-4">
          {node.children.map((child) => (
            <li key={child.category_id} className="flex items-center justify-between py-2.5 pr-4">
              <span className="flex items-center gap-2 text-sm text-foreground">
                <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground" />
                {child.name}
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(child)} aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(child)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
