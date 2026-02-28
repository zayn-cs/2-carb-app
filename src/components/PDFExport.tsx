import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import html2pdf from 'html2pdf.js';

interface PDFExportProps {
  data: any[];
  fields: any[];
  entityName: string;
  title: string;
}

export const PDFExport: React.FC<PDFExportProps> = ({ data, fields, entityName, title }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const opt = {
      margin: 10,
      filename: `${title}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    const element = document.createElement('div');
    element.style.padding = '20px';
    
    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #007bff;">
        <h1 style="color: #007bff; margin: 0; font-size: 24px;">${title}</h1>
        <div style="color: #666; font-size: 14px; margin-top: 5px;">
          Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}<br>
          Nombre d'enregistrements: ${data.length}
        </div>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr>
            ${fields.map(field => `<th style="background-color: #f2f2f2; font-weight: bold; color: #333; padding: 8px; border: 1px solid #ddd;">${field.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr style="${data.indexOf(item) % 2 === 0 ? 'background-color: #f9f9f9;' : ''}">
              ${fields.map(field => `<td style="padding: 8px; border: 1px solid #ddd;">${renderFieldValue(item, field)}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
        Ce document est généré automatiquement par le système DCC-Lab
      </div>
    `;

    document.body.appendChild(element);
    html2pdf().set(opt).from(element).save().then(() => {
      document.body.removeChild(element);
    });
  };

  return (
    <Button onClick={handlePrint} className="flex items-center gap-2 mb-4">
      <FileText className="h-4 w-4" />
      Imprimer PDF
    </Button>
  );
};

const renderFieldValue = (item: any, field: any) => {
  const value = item[field.name];
  
  if (value === null || value === undefined) return '-';
  
  switch (field.type) {
    case 'boolean':
      return value ? 'Oui' : 'Non';
    case 'date':
      return formatDate(value);
    case 'datetime-local':
      return formatDateTime(value);
    case 'number':
      return formatNumber(value);
    default:
      return String(value);
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR');
};

const formatNumber = (number: number) => {
  if (typeof number !== 'number') return '-';
  return new Intl.NumberFormat('fr-FR').format(number);
};
