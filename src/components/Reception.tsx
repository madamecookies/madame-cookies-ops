import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ReceptionData {
  id: string;
  fournisseur: string;
  produit: string;
  quantite: number;
  unite: string;
  lot: string;
  dlc: string;
  temperature: string;
  conformite: string;
  observations: string;
  operateur: string;
  datetime: string;
}

const FOURNISSEURS = [
  'Fournisseur A',
  'Fournisseur B', 
  'Fournisseur C',
  'Moulin Local',
  'Laiterie Régionale',
];

const UNITES = ['kg', 'g', 'L', 'mL', 'pièces', 'sachets'];

const CONFORMITES = ['Conforme', 'Non conforme', 'Conforme avec réserves'];

export const Reception: React.FC = () => {
  const [formData, setFormData] = useState({
    fournisseur: '',
    produit: '',
    quantite: '',
    unite: 'kg',
    lot: '',
    dlc: '',
    temperature: '',
    conformite: '',
    observations: '',
    operateur: '',
  });

  const [receptions, setReceptions] = useState<ReceptionData[]>([]);

  React.useEffect(() => {
    // Charger les réceptions depuis localStorage
    const data = JSON.parse(localStorage.getItem('madame_cookies_data') || '{}');
    if (data.receptions) {
      setReceptions(data.receptions);
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const enregistrerReception = () => {
    if (!formData.fournisseur || !formData.produit || !formData.quantite || !formData.lot || !formData.conformite) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const nouvelleReception: ReceptionData = {
      id: `recep_${Date.now()}`,
      fournisseur: formData.fournisseur,
      produit: formData.produit,
      quantite: parseFloat(formData.quantite),
      unite: formData.unite,
      lot: formData.lot,
      dlc: formData.dlc,
      temperature: formData.temperature,
      conformite: formData.conformite,
      observations: formData.observations,
      operateur: formData.operateur,
      datetime: new Date().toISOString(),
    };

    const nouvelleListe = [nouvelleReception, ...receptions];
    setReceptions(nouvelleListe);

    // Sauvegarder dans localStorage
    const existingData = JSON.parse(localStorage.getItem('madame_cookies_data') || '{}');
    if (!existingData.receptions) existingData.receptions = [];
    existingData.receptions = nouvelleListe;
    localStorage.setItem('madame_cookies_data', JSON.stringify(existingData));

    // Reset du formulaire
    setFormData({
      fournisseur: '',
      produit: '',
      quantite: '',
      unite: 'kg',
      lot: '',
      dlc: '',
      temperature: '',
      conformite: '',
      observations: '',
      operateur: formData.operateur, // Garder l'opérateur
    });
  };

  const getConformiteColor = (conformite: string) => {
    switch (conformite) {
      case 'Conforme': return 'text-success';
      case 'Non conforme': return 'text-destructive';
      case 'Conforme avec réserves': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">
          Réception
        </h1>
        <p className="text-muted-foreground">
          Contrôle des marchandises
        </p>
      </div>

      {/* Formulaire de saisie */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          Nouvelle réception
        </h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="fournisseur">Fournisseur *</Label>
            <Select onValueChange={(value) => handleInputChange('fournisseur', value)}>
              <SelectTrigger className="input-mobile">
                <SelectValue placeholder="Sélectionner un fournisseur" />
              </SelectTrigger>
              <SelectContent>
                {FOURNISSEURS.map(fournisseur => (
                  <SelectItem key={fournisseur} value={fournisseur}>{fournisseur}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="produit">Produit *</Label>
            <Input
              id="produit"
              className="input-mobile"
              value={formData.produit}
              onChange={(e) => handleInputChange('produit', e.target.value)}
              placeholder="ex: Farine T55"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantite">Quantité *</Label>
              <Input
                id="quantite"
                type="number"
                step="0.1"
                className="input-mobile"
                value={formData.quantite}
                onChange={(e) => handleInputChange('quantite', e.target.value)}
                placeholder="ex: 25"
              />
            </div>
            <div>
              <Label htmlFor="unite">Unité</Label>
              <Select value={formData.unite} onValueChange={(value) => handleInputChange('unite', value)}>
                <SelectTrigger className="input-mobile">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITES.map(unite => (
                    <SelectItem key={unite} value={unite}>{unite}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lot">N° de lot *</Label>
              <Input
                id="lot"
                className="input-mobile"
                value={formData.lot}
                onChange={(e) => handleInputChange('lot', e.target.value)}
                placeholder="Lot fournisseur"
              />
            </div>
            <div>
              <Label htmlFor="dlc">DLC</Label>
              <Input
                id="dlc"
                type="date"
                className="input-mobile"
                value={formData.dlc}
                onChange={(e) => handleInputChange('dlc', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="temperature">Température de réception (°C)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              className="input-mobile"
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
              placeholder="ex: 4.5"
            />
          </div>

          <div>
            <Label htmlFor="conformite">Conformité *</Label>
            <Select onValueChange={(value) => handleInputChange('conformite', value)}>
              <SelectTrigger className="input-mobile">
                <SelectValue placeholder="Évaluer la conformité" />
              </SelectTrigger>
              <SelectContent>
                {CONFORMITES.map(conformite => (
                  <SelectItem key={conformite} value={conformite}>{conformite}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="operateur">Opérateur</Label>
            <Input
              id="operateur"
              className="input-mobile"
              value={formData.operateur}
              onChange={(e) => handleInputChange('operateur', e.target.value)}
              placeholder="Nom de l'opérateur"
            />
          </div>

          <div>
            <Label htmlFor="observations">Observations</Label>
            <Textarea
              id="observations"
              className="input-mobile min-h-20"
              value={formData.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              placeholder="Remarques sur l'état, l'emballage..."
            />
          </div>

          <button 
            onClick={enregistrerReception}
            className="btn-primary w-full"
          >
            Enregistrer réception
          </button>
        </div>
      </Card>

      {/* Historique des réceptions */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          Réceptions du jour
        </h2>
        
        {receptions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune réception enregistrée aujourd'hui
          </div>
        ) : (
          <div className="space-y-3">
            {receptions.slice(0, 10).map((reception) => (
              <div key={reception.id} className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-foreground">
                      {reception.produit}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {reception.fournisseur} • {reception.quantite} {reception.unite}
                      {reception.operateur && ` • ${reception.operateur}`}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${getConformiteColor(reception.conformite)}`}>
                    {reception.conformite}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>Lot: {reception.lot}</div>
                  {reception.dlc && <div>DLC: {new Date(reception.dlc).toLocaleDateString()}</div>}
                  {reception.temperature && <div>T°: {reception.temperature}°C</div>}
                </div>
                
                {reception.observations && (
                  <div className="text-sm text-muted-foreground mt-2">
                    {reception.observations}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Résumé des conformités */}
      <Card className="card-elegant p-4">
        <h2 className="text-lg font-semibold mb-4 text-primary">
          Résumé des conformités
        </h2>
        
        <div className="grid grid-cols-3 gap-3">
          {CONFORMITES.map(conformite => {
            const count = receptions.filter(r => r.conformite === conformite).length;
            return (
              <div key={conformite} className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                <div className={`text-xl font-bold ${getConformiteColor(conformite)} mb-1`}>
                  {count}
                </div>
                <div className="text-xs text-muted-foreground">
                  {conformite}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};