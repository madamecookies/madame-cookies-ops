import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Download, Upload, Settings } from 'lucide-react';

export const Exports: React.FC = () => {
  const [exportSettings, setExportSettings] = useState({
    googleSheetsUrl: '',
    autoExport: false,
    intervalMinutes: 5,
    githubToken: '',
    githubRepo: '',
  });

  React.useEffect(() => {
    // Charger les paramètres depuis localStorage
    const settings = localStorage.getItem('madame_cookies_export_settings');
    if (settings) {
      setExportSettings(JSON.parse(settings));
    }
  }, []);

  const sauvegarderParametres = () => {
    localStorage.setItem('madame_cookies_export_settings', JSON.stringify(exportSettings));
    alert('Paramètres sauvegardés');
  };

  const exporterCSV = () => {
    const data = JSON.parse(localStorage.getItem('madame_cookies_data') || '{}');
    
    // Export températures
    if (data.temperatures?.length > 0) {
      const csvTemp = [
        'Date,Heure,Zone,Temperature,Operateur',
        ...data.temperatures.map((t: any) => 
          `${new Date(t.datetime).toLocaleDateString()},${t.heure},${t.zone},${t.temperature},${t.operateur || ''}`
        )
      ].join('\n');
      
      telechargerFichier(csvTemp, 'temperatures.csv');
    }

    // Export productions
    if (data.productions?.length > 0) {
      const csvProd = [
        'Date,Lot,Variete,Quantite,Debut,Fin,Temperature,Observations',
        ...data.productions.map((p: any) => 
          `${new Date(p.datetime).toLocaleDateString()},${p.lot},${p.variete},${p.quantite},${p.debut},${p.fin || ''},${p.temperature || ''},${p.observations || ''}`
        )
      ].join('\n');
      
      telechargerFichier(csvProd, 'productions.csv');
    }

    // Export nettoyages
    if (data.nettoyages?.length > 0) {
      const csvNett = [
        'Date,Heure,Zone,Produit,Actions,Operateur,Observations',
        ...data.nettoyages.map((n: any) => 
          `${new Date(n.datetime).toLocaleDateString()},${n.heure},${n.zone},${n.produit},"${n.actions.join(', ')}",${n.operateur || ''},${n.observations || ''}`
        )
      ].join('\n');
      
      telechargerFichier(csvNett, 'nettoyages.csv');
    }

    // Export réceptions
    if (data.receptions?.length > 0) {
      const csvRecep = [
        'Date,Fournisseur,Produit,Quantite,Unite,Lot,DLC,Temperature,Conformite,Operateur,Observations',
        ...data.receptions.map((r: any) => 
          `${new Date(r.datetime).toLocaleDateString()},${r.fournisseur},${r.produit},${r.quantite},${r.unite},${r.lot},${r.dlc || ''},${r.temperature || ''},${r.conformite},${r.operateur || ''},${r.observations || ''}`
        )
      ].join('\n');
      
      telechargerFichier(csvRecep, 'receptions.csv');
    }

    // Export MP étiquettes
    const mpEtiquettes: any[] = [];
    data.productions?.forEach((p: any) => {
      p.mpEtiquettes?.forEach((mp: any) => {
        mpEtiquettes.push({
          productionId: p.id,
          lot: p.lot,
          variete: p.variete,
          mpNom: mp.nom,
          mpLot: mp.lot,
          mpDlc: mp.dlc,
          photoId: mp.photoId || ''
        });
      });
    });

    if (mpEtiquettes.length > 0) {
      const csvMP = [
        'ProductionID,LotProduction,Variete,MatierePremiere,LotMP,DLC,PhotoID',
        ...mpEtiquettes.map(mp => 
          `${mp.productionId},${mp.lot},${mp.variete},${mp.mpNom},${mp.mpLot},${mp.mpDlc || ''},${mp.photoId}`
        )
      ].join('\n');
      
      telechargerFichier(csvMP, 'mp_etiquettes.csv');
    }

    alert('Exports CSV générés !');
  };

  const telechargerFichier = (contenu: string, nomFichier: string) => {
    const blob = new Blob([contenu], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nomFichier;
    link.click();
  };

  const exporterGoogleSheets = async () => {
    if (!exportSettings.googleSheetsUrl) {
      alert('Veuillez configurer l\'URL Google Sheets');
      return;
    }

    try {
      const data = JSON.parse(localStorage.getItem('madame_cookies_data') || '{}');
      
      const response = await fetch(exportSettings.googleSheetsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperatures: data.temperatures || [],
          productions: data.productions || [],
          nettoyages: data.nettoyages || [],
          receptions: data.receptions || [],
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Données exportées vers Google Sheets !');
      } else {
        throw new Error('Erreur lors de l\'export');
      }
    } catch (error) {
      alert('Erreur lors de l\'export vers Google Sheets');
      console.error(error);
    }
  };

  const handleSettingChange = (field: string, value: any) => {
    setExportSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">
          Exports
        </h1>
        <p className="text-muted-foreground">
          Sauvegarde et exportation des données
        </p>
      </div>

      {/* Actions d'export */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          Exports manuels
        </h2>
        
        <div className="space-y-3">
          <button 
            onClick={exporterCSV}
            className="btn-primary w-full flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger CSV
          </button>
          
          <button 
            onClick={exporterGoogleSheets}
            className="btn-secondary w-full flex items-center justify-center"
            disabled={!exportSettings.googleSheetsUrl}
          >
            <Upload className="w-4 h-4 mr-2" />
            Envoyer vers Google Sheets
          </button>
        </div>
      </Card>

      {/* Configuration Google Sheets */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          <Settings className="w-5 h-5 inline mr-2" />
          Configuration Google Sheets
        </h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="googleSheetsUrl">URL Web App Google Apps Script</Label>
            <Input
              id="googleSheetsUrl"
              className="input-mobile"
              value={exportSettings.googleSheetsUrl}
              onChange={(e) => handleSettingChange('googleSheetsUrl', e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL fournie par votre script Apps Script
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoExport">Export automatique</Label>
              <p className="text-xs text-muted-foreground">
                Synchronisation périodique
              </p>
            </div>
            <Switch
              id="autoExport"
              checked={exportSettings.autoExport}
              onCheckedChange={(checked) => handleSettingChange('autoExport', checked)}
            />
          </div>

          {exportSettings.autoExport && (
            <div>
              <Label htmlFor="intervalMinutes">Intervalle (minutes)</Label>
              <Input
                id="intervalMinutes"
                type="number"
                min="1"
                max="60"
                className="input-mobile"
                value={exportSettings.intervalMinutes}
                onChange={(e) => handleSettingChange('intervalMinutes', parseInt(e.target.value))}
              />
            </div>
          )}

          <button 
            onClick={sauvegarderParametres}
            className="btn-success w-full"
          >
            Sauvegarder la configuration
          </button>
        </div>
      </Card>

      {/* Configuration GitHub (optionnel) */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          Configuration GitHub (optionnel)
        </h2>
        
        <div className="bg-warning-light p-3 rounded-lg mb-4">
          <p className="text-warning-foreground text-sm">
            ⚠️ <strong>Attention:</strong> Le token sera stocké localement dans votre navigateur. 
            Utilisez uniquement pour un repo privé dédié.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="githubToken">Token GitHub (fine-grained)</Label>
            <Input
              id="githubToken"
              type="password"
              className="input-mobile"
              value={exportSettings.githubToken}
              onChange={(e) => handleSettingChange('githubToken', e.target.value)}
              placeholder="ghp_..."
            />
          </div>

          <div>
            <Label htmlFor="githubRepo">Repository (owner/repo)</Label>
            <Input
              id="githubRepo"
              className="input-mobile"
              value={exportSettings.githubRepo}
              onChange={(e) => handleSettingChange('githubRepo', e.target.value)}
              placeholder="username/madame-cookies-data"
            />
          </div>
        </div>
      </Card>

      {/* Informations sur les données */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          Données stockées
        </h2>
        
        <div className="space-y-2 text-sm">
          {(() => {
            const data = JSON.parse(localStorage.getItem('madame_cookies_data') || '{}');
            return (
              <>
                <div className="flex justify-between">
                  <span>Températures:</span>
                  <span className="font-medium">{data.temperatures?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Productions:</span>
                  <span className="font-medium">{data.productions?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nettoyages:</span>
                  <span className="font-medium">{data.nettoyages?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Réceptions:</span>
                  <span className="font-medium">{data.receptions?.length || 0}</span>
                </div>
              </>
            );
          })()}
        </div>
      </Card>
    </div>
  );
};