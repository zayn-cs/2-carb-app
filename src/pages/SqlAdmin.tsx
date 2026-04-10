import { useState, useEffect } from "react";
import { getAll, insert, updateRecord, removeRecord, sqliteDb, initSqlDatabase } from "@/lib/db";
import { entities } from "@/lib/entityConfig";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Save, Trash2, ArrowLeft, Terminal, AlertCircle, Plus, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function SqlAdmin() {
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [data, setData] = useState<any[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    initSqlDatabase().then(() => {
      const allTables = Object.keys(sqliteDb);
      setTables(allTables);
      if (allTables.length > 0) {
        setSelectedTable(allTables[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedTable) {
      setData(getAll(selectedTable));
    }
  }, [selectedTable]);

  const handleCellEdit = (index: number, field: string, value: any) => {
    const newData = [...data];
    newData[index][field] = value;
    setData(newData);
  };

  const handleAddRow = () => {
    if (!selectedTable) return;
    const config = entities.find(e => e.table === selectedTable);
    const newRow: Record<string, any> = {};
    
    // Attempt to pre-fill fields based on config if available, otherwise use keys from existing data
    if (config) {
      config.fields.forEach(f => {
        if (!f.autoIncrement) {
          newRow[f.name] = f.type === "number" ? 0 : f.type === "boolean" ? false : "";
        }
      });
    } else if (data.length > 0) {
      Object.keys(data[0]).forEach(key => {
        newRow[key] = "";
      });
    }

    setData(prev => [newRow, ...prev]);
    toast({ title: "Ligne ajoutée", description: "Veuillez remplir les données et enregistrer" });
  };

  const handleSaveRow = (item: any) => {
    const config = entities.find(e => e.table === selectedTable);
    const pkField = config?.fields.find(f => f.isPrimaryKey)?.name || "id";
    
    try {
      // If it has a PK and we find it in the original data, it's an update.
      // Otherwise, it might be a new insert.
      const existing = getAll(selectedTable).find(old => String(old[pkField]) === String(item[pkField]));
      
      if (existing) {
        updateRecord(selectedTable, pkField, item[pkField], item);
        toast({ title: "Modifié", description: "Enregistrement mis à jour" });
      } else {
        insert(selectedTable, item);
        toast({ title: "Créé", description: "Nouvel enregistrement ajouté" });
        setData(getAll(selectedTable)); // Refresh to get auto-calculated IDs
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleDeleteRow = (id: any) => {
    if (!confirm("Supprimer définitivement cette ligne ?")) return;
    const config = entities.find(e => e.table === selectedTable);
    const pkField = config?.fields.find(f => f.isPrimaryKey)?.name || "id";
    
    try {
      removeRecord(selectedTable, pkField, id);
      setData(getAll(selectedTable));
      toast({ title: "Supprimé", description: "Donnée effacée" });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-primary/20">
      {/* MorphWhite Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto p-8 space-y-10">
        
        {/* Header - Glassmorphic */}
        <div className="flex items-center justify-between bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white rounded-2xl shadow-lg shadow-black/5 border border-white">
              <LayoutGrid className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">System Console</h1>
              <div className="flex items-center gap-2 mt-1">
                 <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                 <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase opacity-70">Direct Data Access Protocol</p>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="rounded-2xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-all px-8 py-6 font-black tracking-widest text-[11px] text-slate-600"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="mr-3 h-5 w-5" /> REVENIR
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-10">
          {/* Table Selector */}
          <div className="col-span-3 space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Database className="h-3 w-3" /> Tables
               </h3>
            </div>
            <div className="flex flex-col gap-2 p-2 bg-white/40 backdrop-blur-sm rounded-[2.5rem] border border-white/60 shadow-sm">
              {tables.map(table => (
                <button
                  key={table}
                  onClick={() => setSelectedTable(table)}
                  className={`flex items-center justify-between px-6 py-4 rounded-[1.5rem] text-left transition-all duration-300 group ${
                    selectedTable === table 
                      ? "bg-white text-primary font-black shadow-xl shadow-black/5 scale-[1.02] border border-slate-100" 
                      : "text-slate-500 hover:bg-white/60"
                  }`}
                >
                  <span className="text-[14px] tracking-tight">{table}</span>
                  {selectedTable === table && <Plus className="h-4 w-4" />}
                </button>
              ))}
            </div>
            
            <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-200/50 space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                <span className="text-[11px] font-black uppercase tracking-widest">Avertissement</span>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                Vous éditez des données brutes. Les contraintes de validation sont minimisées ici pour permettre une flexibilité totale.
              </p>
            </div>
          </div>

          {/* Table Content */}
          <div className="col-span-9 space-y-6">
            <div className="flex items-center justify-between mb-2 px-4">
               <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                 Viewing: <span className="text-primary italic">{selectedTable}</span>
               </h2>
               <Button 
                onClick={handleAddRow}
                className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-black/10 px-8 py-6 font-black text-xs tracking-widest uppercase"
               >
                 <Plus className="mr-3 h-5 w-5 stroke-[3px]" /> Ajouter une ligne
               </Button>
            </div>

            <Card className="rounded-[3rem] bg-white border-white shadow-[0_30px_90px_rgba(0,0,0,0.04)] overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[60vh] scrollbar-thin">
                  <Table>
                    <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md border-b border-slate-100">
                      <TableRow className="hover:bg-transparent">
                        {data.length > 0 && Object.keys(data[0]).map(key => (
                          <TableHead key={key} className="py-8 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                            {key}
                          </TableHead>
                        ))}
                        <TableHead className="w-40 px-8 py-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((item, idx) => (
                        <TableRow key={idx} className="group hover:bg-slate-50/80 transition-all border-slate-50 border-b">
                          {Object.keys(item).map(key => (
                            <TableCell key={key} className="py-6 px-8 min-w-[200px]">
                              <input 
                                className="bg-transparent border-b border-transparent focus:border-primary/30 py-2 text-sm font-bold text-slate-700 w-full outline-none transition-all group-hover:bg-white/50 rounded-lg px-2"
                                value={item[key] === null ? "" : item[key]}
                                onChange={(e) => handleCellEdit(idx, key, e.target.value)}
                              />
                            </TableCell>
                          ))}
                          <TableCell className="px-8 py-6 sticky right-0 bg-white/80 backdrop-blur-md group-hover:bg-white transition-colors border-l border-slate-50 shadow-[-10px_0_20px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl text-primary hover:bg-primary/10 transition-all"
                                onClick={() => handleSaveRow(item)}
                              >
                                <Save className="h-5 w-5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl text-red-400 hover:bg-red-50 transition-all"
                                onClick={() => {
                                  const config = entities.find(e => e.table === selectedTable);
                                  const pkField = config?.fields.find(f => f.isPrimaryKey)?.name || "id";
                                  handleDeleteRow(item[pkField]);
                                }}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {data.length === 0 && (
                  <div className="py-32 text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                       <Database className="h-10 w-10 text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em]">Prêt pour saisie de données</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="text-center pt-20">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.8em] animate-pulse">DCC SYNC ENGINE // MORPH-WHITE EDITION</p>
        </div>
      </div>
    </div>
  );
}
