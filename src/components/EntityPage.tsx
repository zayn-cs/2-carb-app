import { useState, useEffect } from "react";
import { EntityConfig, FieldConfig } from "@/lib/entityConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, AlertTriangle, Printer, Link as LinkIcon } from "lucide-react";
import { useLoading } from "@/context/LoadingContext";
import { getAll, insert, updateRecord, removeRecord, getHistorique } from "@/lib/db";
import html2pdf from 'html2pdf.js';

interface EntityPageProps {
  config: EntityConfig;
}

export default function EntityPage({ config }: EntityPageProps) {
  const { showLoading } = useLoading();
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [editingId, setEditingId] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [columnSearches, setColumnSearches] = useState<Record<string, string>>({});
  const [globalSearch, setGlobalSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [parentData, setParentData] = useState<Record<string, any[]>>({});

  const pkField = config.fields.find(f => f.isPrimaryKey)?.name || "id";

  const fetchItems = async () => {
    try {
      let data: any[] = [];
      if (config.key === "historique") {
        data = getHistorique();
      } else {
        data = getAll(config.table);
      }

      // Fetch lookup data for foreign keys
      const lookupData: Record<string, any[]> = {};
      for (const field of config.fields) {
        if (field.foreignKey) {
          const parentEntity = field.foreignKey.entity;
          const parentTable = parentEntity === "user" ? "utilisateur" : parentEntity; 
          lookupData[field.name] = getAll(parentTable);
        }
      }
      setParentData(lookupData);
      setItems(data);
      setFilteredItems(data);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
    setTimeout(() => setIsLoading(false), 800);
  };

  useEffect(() => {
    fetchItems();
  }, [config.table]);

  useEffect(() => {
    let filtered = [...items];
    if (config.key === "historique" && showAlertsOnly) {
      filtered = filtered.filter(item => item.is_alert === 1 || item.is_alert === true);
    }
    if (globalSearch) {
      filtered = filtered.filter(item =>
        config.fields.some(field =>
          String(item[field.name] || "").toLowerCase().includes(globalSearch)
        )
      );
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
  }, [columnSearches, globalSearch, items, showAlertsOnly]);

  const handleColumnSearch = (fieldName: string, value: string) => {
    setColumnSearches(prev => ({ ...prev, [fieldName]: value }));
  };

  const resetForm = () => {
    setFormData({});
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setFormData(item);
    setEditingId(item[pkField]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    showLoading(800);
    try {
      if (editingId) {
        updateRecord(config.table, pkField, editingId, formData);
        toast({ title: "Succès", description: "Élément mis à jour" });
      } else {
        insert(config.table, formData, pkField);
        toast({ title: "Succès", description: "Élément créé" });
      }
      setDialogOpen(false);
      fetchItems();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Supprimer cet élément ?")) return;
    showLoading(600);
    try {
      removeRecord(config.table, pkField, id);
      toast({ title: "Succès", description: "Supprimé" });
      fetchItems();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handlePrintPDF = (itemsToPrint: any[], title: string) => {
    const opt = {
      margin: 15,
      filename: `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
    };

    const element = document.createElement('div');
    element.className = "p-8 font-sans";

    const itemsHtml = itemsToPrint.map((item, index) => `
      <div style="margin-bottom: 30px; padding: 25px; border: 2px solid #f1f5f9; border-radius: 16px; page-break-inside: avoid; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        <div style="display: flex; justify-between; align-items: center; border-bottom: 2px solid #14b8a6; padding-bottom: 12px; margin-bottom: 20px;">
          <h3 style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 800; text-transform: uppercase;">ENREGISTREMENT #${index + 1}</h3>
          <span style="color: #64748b; font-size: 12px; font-weight: 600;">${config.label}</span>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            ${config.fields.map(field => `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; width: 35%; font-weight: 700; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">${field.label}</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: left; color: #0f172a; font-weight: 600; font-size: 14px;">${getDisplayValue(item, field)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('');

    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 40px; padding: 20px; border: 2px dashed #14b8a6; border-radius: 20px; background-color: #f0fdfa;">
        <div style="font-size: 10px; font-weight: 800; color: #14b8a6; text-transform: uppercase; letter-spacing: 0.3em; margin-bottom: 8px;">SYSTÈME DE GESTION</div>
        <h1 style="color: #0f172a; margin: 0; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em;">${title}</h1>
        <div style="color: #64748b; font-size: 13px; margin-top: 10px; font-weight: 600;">
          DATE D'IMPRESSION: ${new Date().toLocaleDateString('fr-FR')} | QUANTITÉ: ${itemsToPrint.length}
        </div>
      </div>
      
      <div style="padding: 0 10px;">
        ${itemsHtml}
      </div>
      
      <div style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 2px solid #f1f5f9; color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
        DOCUMENT OFFICIEL GÉNÉRÉ PAR LE SYSTÈME LABO - MDN DCC
      </div>
    `;

    document.body.appendChild(element);
    html2pdf().set(opt).from(element).save().then(() => {
      document.body.removeChild(element);
    });
  };

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const getDisplayValue = (item: any, field: FieldConfig) => {
    const value = item[field.name];
    if (value === null || value === undefined) return "-";

    if (field.foreignKey) {
      const options = parentData[field.name] || [];
      const parentPk = field.name.startsWith("id_") ? field.name : "id";
      const found = options.find(o => String(o[parentPk] || o.id_user || o.id_organisme || o.id_laboratoire || o.id_echantillon || o.id_analyse || o.id_laboriste || o.id_diplome || o.id_equipement || o.id_etalonnage || o.id_norme) === String(value));
      return found ? found[field.foreignKey.displayField] : `${value}`;
    }

    if (field.type === "boolean") return value ? "OUI" : "NON";
    return value;
  };

  const renderFieldInput = (field: FieldConfig) => {
    if (field.foreignKey) {
      const options = parentData[field.name] || [];
      const parentPk = field.name.startsWith("id_") ? field.name : "id";
      
      return (
        <Select 
          value={String(formData[field.name] || "")} 
          onValueChange={(val) => handleChange(field.name, Number(val))}
        >
          <SelectTrigger className="col-span-2 rounded-xl border-slate-200">
            <SelectValue placeholder={`Sélectionner ${field.label}`} />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-2xl">
            {options.map((opt) => {
              const id = opt[parentPk] || opt.id_user || opt.id_organisme || opt.id_laboratoire || opt.id_echantillon || opt.id_analyse || opt.id_laboriste || opt.id_diplome || opt.id_equipement || opt.id_etalonnage || opt.id_norme;
              return (
                <SelectItem key={id} value={String(id)} className="rounded-lg font-medium">
                  {opt[field.foreignKey!.displayField]}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === "boolean") {
      const isConformite = field.name.toLowerCase().includes("conforme") || field.label.toLowerCase().includes("conforme");
      const leftLabel = isConformite ? "NON CONFORME" : "NON";
      const rightLabel = isConformite ? "CONFORME" : "OUI";

      return (
        <div className="col-span-2 flex items-center gap-4">
          <span className={`text-[9px] font-black tracking-widest transition-colors ${!formData[field.name] ? "text-red-500" : "text-slate-300"}`}>
            {leftLabel}
          </span>
          <Switch
            checked={!!formData[field.name]}
            onCheckedChange={(checked) => handleChange(field.name, checked)}
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-red-200"
          />
          <span className={`text-[9px] font-black tracking-widest transition-colors ${formData[field.name] ? "text-primary" : "text-slate-300"}`}>
            {rightLabel}
          </span>
        </div>
      );
    }

    return (
      <Input
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={formData[field.name] || ""}
        onChange={(e) => handleChange(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)}
        className="col-span-2 rounded-xl border-slate-200 font-semibold"
        required={field.required}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-[1440px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl shadow-inner border border-primary/20">
              <config.icon className="h-10 w-10 text-primary" />
            </div>
            {config.label}
          </h1>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-[0.3em] text-[10px] pl-1">Command Center / Gestion des Ressources</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 font-bold px-6 h-12 hover:bg-slate-50" onClick={() => fetchItems()}>
            ACTUALISER
          </Button>
          {config.key !== "historique" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate} className="rounded-xl shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 px-8 h-12 font-black text-sm tracking-widest">
                  <Plus className="mr-2 h-5 w-5 stroke-[3px]" />
                  NOUVEAU
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl rounded-[2.5rem] p-10 border-none shadow-2xl">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900">
                    {editingId ? `Modifier ${config.label}` : `Nouvel Enregistrement`}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  {config.fields.map(field => {
                    if (field.isPrimaryKey && !field.foreignKey) return null;
                    return (
                      <div key={field.name} className="grid grid-cols-3 items-center gap-8">
                        <Label className="text-right font-black uppercase text-[10px] tracking-widest text-slate-400">
                          {field.label}
                        </Label>
                        {renderFieldInput(field)}
                      </div>
                    );
                  })}
                  <Button onClick={handleSave} className="h-14 rounded-[1.25rem] font-black text-lg mt-6 uppercase tracking-widest shadow-lg shadow-primary/20">
                    Enregistrer les données
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="md:col-span-3 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
          <Input
            placeholder={`Recherche intelligente dans ${config.label}...`}
            className="pl-14 h-16 rounded-[2rem] border-transparent bg-slate-50/50 focus:bg-white transition-all text-lg font-semibold placeholder:text-slate-300"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          className="h-16 rounded-[2rem] border-slate-200 font-black uppercase tracking-[0.15em] text-[11px] hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group"
          onClick={() => {
            const list = selectedIds.length > 0 ? items.filter(i => selectedIds.includes(i[pkField])) : filteredItems;
            handlePrintPDF(list, `Rapport de ${config.label}`);
          }}
        >
          <Printer className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
          Imprimer PDF
        </Button>
      </div>

      <Card className="rounded-[3rem] border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow className="hover:bg-transparent border-slate-100 border-b-2">
                  <TableHead className="w-20 text-center py-8 font-black uppercase text-[11px] tracking-[0.25em] text-slate-900">ID</TableHead>
                  {config.fields.filter(f => !f.isPrimaryKey || f.foreignKey).map(field => (
                    <TableHead key={field.name} className="py-8 px-4 font-black uppercase text-[11px] tracking-[0.1em] text-slate-500 min-w-[200px]">
                      <div className="flex flex-col gap-3">
                        <span>{field.label}</span>
                        <div className="relative group/search">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300 group-focus-within/search:text-primary transition-colors" />
                           <Input
                             placeholder={`Filtrer...`}
                             className="h-9 pl-8 rounded-lg border-slate-200 bg-white shadow-sm text-[10px] font-bold focus:ring-1 focus:ring-primary/20 transition-all"
                             value={columnSearches[field.name] || ""}
                             onChange={(e) => handleColumnSearch(field.name, e.target.value)}
                           />
                        </div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-right pr-12 font-black uppercase text-[11px] tracking-[0.25em] text-slate-400"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={config.fields.length + 2} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-slate-50 rounded-full">
                          <Search className="h-10 w-10 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Aucun enregistrement disponible</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item, idx) => (
                    <TableRow key={item[pkField] || idx} className="group hover:bg-slate-50/50 transition-all duration-300 border-slate-50 border-b last:border-0">
                      <TableCell className="text-center font-black text-slate-900 text-sm py-6">{idx + 1}</TableCell>
                      {config.fields.filter(f => !f.isPrimaryKey || f.foreignKey).map(field => (
                        <TableCell key={field.name} className="py-6 font-bold text-slate-700 tracking-tight">
                          {field.foreignKey ? (
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[10px] bg-slate-100/80 text-slate-700 text-[11px] font-black uppercase tracking-wider border border-slate-200/50 shadow-sm transition-colors group-hover:bg-white">
                              <LinkIcon className="h-3 w-3 text-primary stroke-[3px]" />
                              {getDisplayValue(item, field)}
                            </span>
                          ) : (
                            <span className="text-sm font-semibold">{getDisplayValue(item, field)}</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right pr-8 space-x-2">
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all group-hover:scale-105" onClick={() => handlePrintPDF([item], `Fiche Individuelle - ${config.label}`)}>
                          <Printer className="h-4.5 w-4.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-200 transition-all group-hover:scale-105" onClick={() => openEdit(item)}>
                          <Pencil className="h-4.5 w-4.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-50 hover:text-red-500 transition-all group-hover:scale-105" onClick={() => handleDelete(item[pkField])}>
                          <Trash2 className="h-4.5 w-4.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center pt-8">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] animate-pulse">Base de données sécurisée LABO</p>
      </div>
    </div>
  );
}

