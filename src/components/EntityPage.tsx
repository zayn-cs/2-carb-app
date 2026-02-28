import { useState, useEffect } from "react";
import { EntityConfig } from "@/lib/entityConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, AlertTriangle } from "lucide-react";
import { useLoading } from "@/context/LoadingContext";
import { getAll, insert, updateRecord, removeRecord, getHistorique } from "@/lib/db";

interface EntityPageProps {
  config: EntityConfig;
}

export default function EntityPage({ config }: EntityPageProps) {
  const { showLoading } = useLoading();
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [columnSearches, setColumnSearches] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const currentUser = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("currentUser") || "null")
    : null;

  useEffect(() => {
    const initialSearches: Record<string, string> = {};
    config.fields.forEach(field => {
      initialSearches[field.name] = "";
    });
    setColumnSearches(initialSearches);
  }, [config.fields]);

  const fetchItems = async () => {
    try {
      let data: any[] = [];

      if (config.key === "historique") {
        data = getHistorique();
        console.log("Fetched historique:", data.length, "entries");
      } else {
        data = getAll(config.table);
      }

      setItems(data);
      setFilteredItems(data);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
    setTimeout(() => setIsLoading(false), 1000);
  };

  useEffect(() => {
    fetchItems();
  }, [config.table]);

  useEffect(() => {
    let filtered = [...items];

    if (config.key === "historique" && showAlertsOnly) {
      filtered = filtered.filter(item => item.is_alert === 1 || item.is_alert === true);
    }

    config.fields.forEach(field => {
      const searchValue = columnSearches[field.name]?.toLowerCase().trim();
      if (searchValue) {
        filtered = filtered.filter(item => {
          const value = String(item[field.name] || "").toLowerCase();
          return value.includes(searchValue);
        });
      }
    });

    setFilteredItems(filtered);
  }, [columnSearches, items, showAlertsOnly]);

  const handleColumnSearch = (fieldName: string, value: string) => {
    setColumnSearches(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const resetForm = () => {
    setFormData({});
    setEditingId(null);
  };

  const openCreate = async () => {
    showLoading(1500);
    await new Promise(resolve => setTimeout(resolve, 1500));
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = async (item: any) => {
    showLoading(500);
    await new Promise(resolve => setTimeout(resolve, 500));
    setFormData(item);
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    showLoading(1000);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (editingId) {
        updateRecord(config.table, editingId, formData);
        toast({ title: "Succes", description: "Element mis a jour avec succes" });
      } else {
        insert(config.table, formData);
        toast({ title: "Succes", description: "Element cree avec succes" });
      }
      setDialogOpen(false);
      fetchItems();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Etes-vous sur de vouloir supprimer cet element?")) return;

    showLoading(1000);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      removeRecord(config.table, id);
      toast({ title: "Succes", description: "Element supprime avec succes" });
      fetchItems();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const formatValue = (value: any, type: string) => {
    if (type === "boolean") {
      return value ? "Oui" : "Non";
    }
    if (type === "datetime-local" && value) {
      const date = new Date(value);
      return date.toLocaleString("fr-FR");
    }
    return value;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{config.label}</h1>
      </div>

      {config.key !== "historique" && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-10"
              onChange={(e) => {
                const searchValue = e.target.value.toLowerCase();
                const filtered = items.filter(item =>
                  config.fields.some(field =>
                    String(item[field.name] || "").toLowerCase().includes(searchValue)
                  )
                );
                setFilteredItems(filtered);
              }}
            />
          </div>
        </div>
      )}

      {config.key === "historique" && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="showAlertsOnly"
              checked={showAlertsOnly}
              onCheckedChange={setShowAlertsOnly}
            />
            <Label htmlFor="showAlertsOnly" className="flex items-center gap-2 cursor-pointer">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Afficher uniquement les alertes
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const visibleIds = filteredItems.map(i => i.id);
                const allSelected = visibleIds.length > 0 && selectedIds.length === visibleIds.length;
                if (allSelected) {
                  setSelectedIds([]);
                } else {
                  setSelectedIds(visibleIds);
                }
              }}
            >
              {(filteredItems.length > 0 && selectedIds.length === filteredItems.length) ? "Désélectionner tout" : "Tout sélectionner"}
            </Button>
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  if (!confirm(`Etes-vous sur de vouloir supprimer ${selectedIds.length} element(s)?`)) return;
                  showLoading(1000);
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  try {
                    selectedIds.forEach(id => removeRecord(config.table, id));
                    toast({ title: "Succès", description: "Éléments supprimés avec succès" });
                    setSelectedIds([]);
                    fetchItems();
                  } catch (error: any) {
                    toast({ title: "Erreur", description: error.message, variant: "destructive" });
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Liste des {config.label}s</CardTitle>
            {config.key !== "historique" && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingId ? `Modifier ${config.label}` : `Ajouter ${config.label}`}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {config.fields.map(field => (
                      <div key={field.name} className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor={field.name} className="text-right">{field.label}</Label>
                        {field.type === "boolean" ? (
                          <Switch
                            id={field.name}
                            checked={!!formData[field.name]}
                            onCheckedChange={(checked) => handleChange(field.name, checked)}
                          />
                        ) : (
                          <Input
                            id={field.name}
                            type={field.type === "number" ? "number" : "text"}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleChange(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)}
                            className="col-span-2"
                            required={field.required}
                          />
                        )}
                      </div>
                    ))}
                    <Button onClick={handleSave} className="mt-4">
                      Sauvegarder
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {config.key === "historique" && <TableHead className="p-1 w-12 text-center"></TableHead>}
                {config.fields.map(field => (
                  <TableHead key={field.name} className="p-1">
                    <Input
                      placeholder={`Rechercher...`}
                      className="h-8 text-sm"
                      value={columnSearches[field.name] || ""}
                      onChange={(e) => handleColumnSearch(field.name, e.target.value)}
                    />
                  </TableHead>
                ))}
                <TableHead className="p-1"></TableHead>
              </TableRow>
              <TableRow>
                {config.key === "historique" && <TableHead className="w-12 text-center border-r">Sel.</TableHead>}
                {config.fields.map(field => (
                  <TableHead key={field.name} className="text-right">{field.label}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={config.fields.length + (config.key === "historique" ? 2 : 1)} className="text-center py-8">
                    <p className="text-muted-foreground">
                      Aucun element trouve
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const isAlert = item.is_alert === 1 || item.is_alert === true;
                  return (
                    <TableRow key={item.id} className={isAlert ? "bg-orange-50" : ""}>
                      {config.key === "historique" && (
                        <TableCell className="text-center border-r">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                            checked={selectedIds.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds(prev => [...prev, item.id]);
                              } else {
                                setSelectedIds(prev => prev.filter(id => id !== item.id));
                              }
                            }}
                          />
                        </TableCell>
                      )}
                      {config.fields.map(field => (
                        <TableCell key={field.name} className={`text-right ${isAlert ? "text-orange-700 font-medium" : ""}`}>
                          {field.name === "is_alert" && isAlert ? (
                            <span className="flex justify-end items-center gap-1">
                              Alerte
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            </span>
                          ) : (
                            formatValue(item[field.name], field.type)
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right space-x-1 whitespace-nowrap">
                        {config.key !== "historique" && (
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
